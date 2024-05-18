const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');
const FormData = require('form-data');

const createHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const createTag = async (token, giteaURL, repositoryName, tagName, tagDescription, target) => {
  const url = `${giteaURL}/repos/${repositoryName}/tags`;
  const body = { message: tagDescription, tag_name: tagName, target: target };
  const headers = createHeaders(token);

  try {
    const response = await axios.post(url, body, { headers });
    if (response.status >= 200 && response.status < 300) {
      const { commit, name } = response.data;
      return { sha: commit.sha, name };
    }
  } catch (error) {
    throw new Error(`Ошибка при создании тега. Код: ${error.response.status} Текст: ${error.response.data}`);
  }
};

const createRelease = async (token, giteaURL, repositoryName, releaseName, releaseDescription, tagName, tagSha) => {
  const url = `${giteaURL}/repos/${repositoryName}/releases`;
  const data = {
    body: releaseDescription,
    draft: false,
    name: releaseName,
    prerelease: false,
    tag_name: tagName,
    target_commitish: tagSha,
  };
  const headers = createHeaders(token);

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status >= 200 && response.status < 300) {
      const { id, name } = response.data;
      return { id, name };
    }
  } catch (error) {
    throw new Error(`Ошибка при создании релиза. Код: ${error.response.status} Текст: ${error.response.data}`);
  }
};

const createAttachment = async (token, giteaURL, repositoryName, attachmentPath, attachmentName, releaseId) => {
  execSync(`tar -C ${attachmentPath} -czf /tmp/attachment.tar.gz .`);
  const fileData = fs.readFileSync('/tmp/attachment.tar.gz');
  const form = new FormData();
  form.append('attachment', fileData, {
    filename: `${attachmentName}.tar.gz`,
    contentType: 'application/gzip',
  });

  const url = `${giteaURL}/repos/${repositoryName}/releases/${releaseId}/assets?name=${attachmentName}.tar.gz`;
  const headers = { Authorization: `token ${token}`, ...form.getHeaders() };

  try {
    const response = await axios.post(url, form, { headers });
    if (response.status >= 200 && response.status < 300) {
      const { id, name } = response.data;
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