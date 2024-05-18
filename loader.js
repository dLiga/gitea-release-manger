const core = require('@actions/core');
const github = require('@actions/github');

const { createTag, createRelease, createAttachment } = require('./repoHelper');

const token = core.getInput('token');
const giteaURL = core.getInput('repo');
const repositoryUser = core.getInput('login');
const repositoryName = core.getInput('repositoryName');
const command = core.getInput('command');
const tag = core.getInput('tag');//'v1.0.0'
const path = core.getInput('path');//'./path/to/your/attachment'

try {
  switch (command) {
      case 'createTag':
          const tagResult = await createTag(token, giteaURL, repositoryUser, repositoryName, tag, tag, 'main');
          console.log("Тэг создан: SHA=${tagResult.sha}, Name=${tagResult.name}");
          break;
      case 'createRelease':
          const releaseResult = await createRelease(token, giteaURL, repositoryUser, repositoryName, tag, tag, tag, tagResult.sha);
          console.log("Релиз создан: ID=${releaseResult.id}, Name=${releaseResult.name}");
          break;
      case 'createAttachment':
          const attachmentResult = await createAttachment(token, giteaURL, repositoryUser, repositoryName, path, tag + ".tar.gz", releaseResult.id);
          console.log("Вложение загружено: ID=${attachmentResult.id}, Name=${attachmentResult.name}");
          break;
      default:
          core.setFailed("Такая команда не найдена");
          break;
  }
} catch (error) {
  core.setFailed(error.message);
}