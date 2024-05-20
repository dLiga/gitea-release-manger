const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('child_process');

const { createTag, createRelease, createAttachment } = require('./repoHelper');

const token = core.getInput('token');
const giteaURL = core.getInput('url');
const repository = core.getInput('repository');
const command = core.getInput('command');
var tag = core.getInput('tag');//'v1.0.0'
const path = core.getInput('path');//'./path/to/your/attachment'
const attachmentName = core.getInput('attachmentName');

const fullCreate = async () => {
  try {
    const tagData = await createTag(token, giteaURL, repository, tag, tag);
    const releaseData = await createRelease(token, giteaURL, repository, tag, tag, tag);
    const releaseId = releaseData.id; // используем идентификатор релиза для загрузки вложения
    const attachmentData = await createAttachment(token, giteaURL, repository, path, attachmentName, releaseId);
    console.log('Все операции выполнены успешно.');
  } catch (error) {
    core.setFailed(`Ошибка при выполнении операций: ${error.message}`);
  }
};

const getLastCommitMessage = async () => {
  return new Promise((resolve, reject) => {
    exec('git log -1 --pretty=%B', (error, stdout, stderr) => {
      if (error) {
        console.error('Ошибка при выполнении git команды:', error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error('stderr:', stderr);
        reject(new Error(stderr));
        return;
      }

      resolve(stdout.trim());
    });
  });
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
          if (tag == ""){
            tag = getLastCommitMessage();
          }
          fullCreate();       
          break;
      default:
          core.setFailed("Такая команда не найдена");
          break;
  }
} catch (error) {
  core.setFailed(error.message);
}

