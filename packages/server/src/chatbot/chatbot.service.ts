import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InteractionModel } from './interaction.entity';
import { ChatbotQuestionModel } from './question.entity';
import { CourseModel } from 'course/course.entity';
import { UserModel } from 'profile/user.entity';
import {
  ChatBotQuestionParams,
  Interaction,
  InteractionParams,
} from '@koh/common';

import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';

export interface ChatbotResponse {
  answer: string;
  sourceDocuments: {
    [key: string]: Set<string>;
  };
  similarDocuments: {
    [key: string]: Set<string>;
  };
  similarQuestions: any[]; // TODO: Find correct datatype
}

@Injectable()
export class ChatbotService {
  // Could rename 'documents' to 'resources' for more accurate wording when its not only PDFs
  // filePath currently relative

  documentStore: PineconeStore;
  questionIndex: any;
  embeddings: OpenAIEmbeddings;

  async createInteraction(data: InteractionParams): Promise<InteractionModel> {
    const course = await CourseModel.findOne(data.courseId);
    const user = await UserModel.findOne(data.userId);

    if (!course) {
      throw new HttpException(
        'Course not found based on the provided ID.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (!user) {
      throw new HttpException(
        'User not found based on the provided ID.',
        HttpStatus.NOT_FOUND,
      );
    }

    const interaction = InteractionModel.create({
      course,
      user,
      timestamp: new Date(),
    });

    return await interaction.save();
  }

  async createQuestion(
    data: ChatBotQuestionParams,
  ): Promise<ChatbotQuestionModel> {
    const interaction = await InteractionModel.findOne(data.interactionId);
    if (!interaction) {
      throw new HttpException(
        'Interaction not found based on the provided ID.',
        HttpStatus.NOT_FOUND,
      );
    }

    const question = ChatbotQuestionModel.create({
      interaction,
      interactionId: data.interactionId,
      questionText: data.questionText,
      responseText: data.responseText,
      timestamp: new Date(),
    });

    return await question.save();
  }

  init = async () => {
    const embeddings = new OpenAIEmbeddings();
    // {
    // openAIApiKey: process.env.OPENAI_API_KEY,
    // modelName: 'ada',
    // }

    const documentClient = new PineconeClient();
    await documentClient.init({
      apiKey: process.env.PINECONE_API_KEY_DOCUMENT,
      environment: process.env.PINECONE_ENVIRONMENT_DOCUMENT,
    });
    const documentIndex = documentClient.Index(
      process.env.PINECONE_INDEX_NAME_DOCUMENT,
    );

    const documentStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: documentIndex,
    });

    const questionClient = new PineconeClient();
    await questionClient.init({
      apiKey: process.env.PINECONE_API_KEY_QUESTION,
      environment: process.env.PINECONE_ENVIRONMENT_QUESTION,
    });
    const questionIndex = questionClient.Index(
      process.env.PINECONE_INDEX_NAME_QUESTION,
    );

    this.documentStore = documentStore;
    this.questionIndex = questionIndex;
    this.embeddings = embeddings;
  };

  getDirectoryLoader = async (filePath: string) => {
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path, { splitPages: true }),
      // '.docx': path => new DocxLoader(path),
      // '.json': path => new JSONLoader(path, '/texts'),
      // '.jsonl': path => new JSONLinesLoader(path, '/html'),
      '.txt': (path) => new TextLoader(path),
      // '.csv': path => new CSVLoader(path, 'text'),
      // '.htm': path => new UnstructuredLoader(path),
      // '.html': path => new UnstructuredLoader(path),
      // '.ppt': path => new UnstructuredLoader(path),
      // '.pptx': path => new UnstructuredLoader(path),
    });

    return directoryLoader;
  };

  addDocuments = async (documents: Document[]) => {
    // Returns Ids of documents for storing and possible future deletion
    const ids = await this.documentStore.addDocuments(documents);
    return ids;
  };

  deleteDocuments = async (ids: string[]) => {
    await this.documentStore.delete({
      ids,
    });
  };

  loadDocuments = async (directoryLoader: DirectoryLoader) => {
    const documents = directoryLoader.load();
    return documents;
  };

  splitDocuments = async (documents: Document[]) => {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 20,
    });

    const documentChunks = splitter.splitDocuments(documents);
    return documentChunks;
  };

  initializePineconeStore = async (filePath: string) => {
    const directoryLoader = await this.getDirectoryLoader(filePath);
    const rawDocuments = await this.loadDocuments(directoryLoader);
    const documentChunks = await this.splitDocuments(rawDocuments);

    await this.addDocuments(documentChunks);
  };

  ask = async (query: string): Promise<ChatbotResponse> => {
    const chainResponse = await this.callQAChain(query);

    const similarDocuments = await this.getSimilarDocuments(query);
    const similarQuestions = await this.getSimilarQuestions(query);

    // Convert to nested class to handle PDFs, TXTs, Webpages, etc
    const groupedSourceDocuments: {
      [key: string]: Set<string>;
    } = {};
    chainResponse.sourceDocuments.map((sourceDocument: any) => {
      let group: Set<string> =
        groupedSourceDocuments[sourceDocument.metadata['pdf.info.Title']];

      if (!group) {
        group = new Set<string>();
      }
      group.add(sourceDocument.metadata['loc.pageNumber']);
      groupedSourceDocuments[sourceDocument.metadata['pdf.info.Title']] = group;
    });
    // { 'COSC 404 - R-Trees': Set(5) { 8, 2, 23 }, 'COSC 404 - B-Trees': Set(5) { 4, 9 }}

    const groupedSimilarDocuments: {
      [key: string]: Set<string>;
    } = {};
    similarDocuments.map((similarDocument: any) => {
      let group: Set<string> =
        groupedSimilarDocuments[similarDocument.metadata['pdf.info.Title']];

      if (!group) {
        group = new Set<string>();
      }
      group.add(similarDocument.metadata['loc.pageNumber']);
      groupedSimilarDocuments[similarDocument.metadata['pdf.info.Title']] =
        group;
    });

    await this.insertQuestion({
      query,
      answer: chainResponse.text,
      sourceDocuments: groupedSourceDocuments,
      similarDocuments: groupedSimilarDocuments,
    });

    return {
      answer: chainResponse.text,
      sourceDocuments: groupedSourceDocuments,
      similarDocuments: groupedSimilarDocuments,
      similarQuestions: similarQuestions.matches,
    };
  };

  callQAChain = async (query: string, temperature = 0) => {
    // Can be changed to ConversationalRetrievalQAChain to allow for chat history

    const chain = VectorDBQAChain.fromLLM(
      // Allow configurable temperature & modelName
      new OpenAI({ temperature }),
      this.documentStore,
      {
        k: 5,
        returnSourceDocuments: true,
      },
    );

    const response = await chain.call({ query });
    return response;
  };

  getSimilarDocuments = async (query: string, k = 5, score = false) => {
    if (score) {
      return this.documentStore.similaritySearchWithScore(query, k);
    } else {
      return this.documentStore.similaritySearch(query, k);
    }
  };

  insertQuestion = async ({
    query,
    answer,
    sourceDocuments,
    similarDocuments,
  }) => {
    // TODO: Add record to postgres database and retrieve ID of inserted record
    // Update database schema to store sourceDocuments and similarDocuments
    // Update this.createQuestion parameteres

    const questionVector = await this.embeddings.embedQuery(query);

    const vectorRecords = [
      {
        id: '1', // TO be retrieved from inserted record in postgres
        values: questionVector,
        metadata: {
          question: query,
        },
      },
    ];

    await this.questionIndex.upsert({
      upsertRequest: {
        vectors: vectorRecords,
      },
    });
  };

  getSimilarQuestions = async (question: string) => {
    const questionVector = await this.embeddings.embedQuery(question);

    const similarQuestions = await this.questionIndex.query({
      queryRequest: {
        vector: questionVector,
        topK: 5,
        includeMetadata: true,
      },
    });
    return similarQuestions;
  };

  getEmbeddings = () => {
    return this.embeddings;
  };

  // Currently using free version of Pinecone which only allows 1 index. Refactor once paid
  getPineconeDocumentStore = () => {
    return this.documentStore;
  };

  getPineconeQuestionIndex = () => {
    return this.questionIndex;
  };
}
