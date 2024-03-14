# UBC Office Hours

This app helps student navigate and queue in office hours. It solves the complex office hour queue system, makes it more convenient for students to ask questions, and easier for TA/Professors to manage office hours.

The system was developed by Khoury College, but the forked project is adapted to use in UBCO.

New features such as Chatbot built on concepts of retrieval augmented generation has been integrated through a different API service that is not part of this office hour system. 

## Installation
The easiest way to spin up the system is through Docker

Docker container uses a different environment variable file that can be found [here](packages/server/.env.docker). This file should stay up to date within other environment variable files. Change the environment variables to match your environment.

The docker image should only be used on cloud service or developer to verify the final changes in pull request; this is because API service's image needs to be rebuild when new code changes are made. Instead, follow the steps in this [section](#running-locally-outside-of-docker-container) if you constantly making changes to the API.

1. Start the database and api services within a Docker:

```bash
docker-compose build && docker-compose up
```

2. Visit the app at http://localhost:80 (or http://localhost)


## Developing

[Developing Guide](DEVELOPING.md)


## License
GPL-3.0

