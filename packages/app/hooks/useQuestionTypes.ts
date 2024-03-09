import { API } from '@koh/api-client'

export function useQuestionTypes(cid: number, qid: number): string[] {
  ;async () =>
    API.questions.getQuestionTypes(cid, qid).then((results) => {
      if (!results) {
        return null
      }
      return results
    })
  return null
}
