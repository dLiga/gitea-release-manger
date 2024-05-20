const core = require('@actions/core');
const github = require('@actions/github');

const { createTag, createRelease, createAttachment } = require('./repoHelper');

const token = core.getInput('token');
const giteaURL = core.getInput('url');
const repository = core.getInput('repository');
const command = core.getInput('command');
const tag = core.getInput('tag');//'v1.0.0'
const path = core.getInput('path');//'./path/to/your/attachment'
const attachmentName = core.getInput('attachmentName');

const fullCreate = async () => {
  try {
    const tagData = await createTag(token, giteaURL, repository, tagName, tagDescription);
    const releaseData = await createRelease(token, giteaURL, repository, releaseName, releaseDescription, tagName);
    const releaseId = releaseData.id; // используем идентификатор релиза для загрузки вложения
    const attachmentData = await createAttachment(token, giteaURL, repository, attachmentPath, attachmentName, releaseId);
    console.log('Все операции выполнены успешно.');
  } catch (error) {
    console.error('Ошибка при выполнении операций:', error.message);
  }
};

try {
  switch (command) {
      case 'createTag':
          const tagResult = createTag(token, giteaURL, repository, tag, tag);         
          break;
      case 'createRelease':
          const releaseResult = createRelease(token, giteaURL, repository, tag, tag, tag);
          core.setOutput('release',releaseResult.id);
          break;
      case 'createAttachment':
          const attachmentResult = createAttachment(token, giteaURL, repository, path, attachmentName, releaseResult.id);
          break;
      case 'fullCreate':
          fullCreate();       
          break;
      default:
          core.setFailed("Такая команда не найдена");
          break;
  }
} catch (error) {
  core.setFailed(error.message);
}

