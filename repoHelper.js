const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');
const FormData = require('form-data');

const createHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const createTag = async (token, giteaURL, repository, tagName, tagDescription, target) => {

};

const createRelease = async (token, giteaURL, repository, releaseName, releaseDescription, tagName) => {
  const url = `${giteaURL}/api/v1/repos/${repository}/releases?token=${token}`;
  console.log('Ссылка: ', url);
  const releaseData = {
    body: releaseDescription,
    draft: true,
    name: releaseName,
    prerelease: true,
    tag_name: tagName,
    target_commitish: tagName
  };

  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  axios.post(url, releaseData, { headers })
  .then(response => {
    console.log('Релиз создан:', response.data);
  })
  .catch(error => {
    console.error('Ошибка при создании релиза:', error.response ? error.response.data : error.message);
  });
};

const createAttachment = async (token, giteaURL, repositoryName, attachmentPath, attachmentName, releaseId) => {
  execSync(`tar -C ${attachmentPath} -czf /tmp/attachment.tar.gz .`);
  const fileData = fs.readFileSync('/tmp/attachment.tar.gz');
  const form = new FormData();
  form.append('attachment', fileData, {
    filename: `${attachmentName}.tar.gz`,
    contentType: 'application/gzip',
  });

  const url = `${giteaURL}/${repositoryName}/releases/${releaseId}/assets?name=${attachmentName}.tar.gz`;
  const headers = { Authorization: `token ${token}`, ...form.getHeaders() };

  try {
    const response = await axios.post(url, form, { headers });
    if (response.status >= 200 && response.status < 300) {
      const { id, name } = response.data;
      console.log("Тэг создан: ${response.data}");
      return { id, name };
    }
  } catch (error) {
    throw new Error(`Ошибка при загрузке вложения. Код: ${error.response.status} Текст: ${error.response.data}`);
  }
};

module.exports = {
  createTag,
  createRelease,
  createAttachment,
};