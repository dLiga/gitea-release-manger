const core = require('@actions/core');
const github = require('@actions/github');

const { createTag, createRelease, createAttachment } = require('./repoHelper');

const token = core.getInput('token');
const giteaURL = core.getInput('url');
const repository = core.getInput('repository');
const command = core.getInput('command');
const tag = core.getInput('tag');//'v1.0.0'
const path = core.getInput('path');//'./path/to/your/attachment'

try {
  switch (command) {
      case 'createTag':
          const tagResult = createTag(token, giteaURL, repository, tag, tag, 'main');         
          break;
      case 'createRelease':
          const releaseResult = createRelease(token, giteaURL, repository, tag, tag, tag, "");
          console.log("Релиз создан: ID=${releaseResult.id}, Name=${releaseResult.name}");
          break;
      case 'createAttachment':
          const attachmentResult = createAttachment(token, giteaURL, repository, path, tag + ".tar.gz", releaseResult.id);
          console.log("Вложение загружено: ID=${attachmentResult.id}, Name=${attachmentResult.name}");
          break;
      default:
          core.setFailed("Такая команда не найдена");
          break;
  }
} catch (error) {
  core.setFailed(error.message);
}