const core = require('@actions/core');
const axios = require('axios');

async function getCurrentStateVersion(client, workspaceId) {
  try {
    const { data } = await client.get(`/workspaces/${workspaceId}/current-state-version`);

    const stateVersionId = data?.data?.id;
    if (!stateVersionId) throw new Error('No current state was found.');

    return stateVersionId;
  } catch (err) {
    throw new Error(`Failed to get the current state version: ${err.message}`);
  }
}

async function getOutputs(client, stateVersionId) {
  try {
    const { data } = await client.get(`/state-versions/${stateVersionId}/outputs`);

    const tfOutputs = data?.data;
    if (!tfOutputs) throw new Error('No outputs were found.');

    return tfOutputs.reduce((outputs, { attributes }) => {
      const { name, sensitive, value } = attributes;
      if (sensitive) core.setSecret(value);
      outputs[name] = value;
      return outputs;
    }, {});
  } catch (err) {
    throw new Error(`Failed to get the outputs: ${err.message}`);
  }
}

async function setOutputs(outputs, desiredOutputs) {
  desiredOutputs.forEach((outputName) => {
    const value = outputs[outputName];
    if (value === undefined) {
      core.error(`No Terraform output was found with the name ${outputName}`);
    }

    core.setOutput(outputName, value);
  });
}

async function run() {
  const apiToken = core.getInput('api-token', { required: true });
  const workspaceId = core.getInput('workspace-id', { required: true });
  const desiredOutputs = core.getMultilineInput('outputs', { required: true });

  // Make sure we don't leak the API token in the logs
  core.setSecret(apiToken);

  const client = axios.create({
    baseURL: 'https://app.terraform.io/api/v2',
    timeout: 5000,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/vnd.api+json',
    }
  });

  try {
    const stateVersionId = await getCurrentStateVersion(client, workspaceId);
    const outputs = await getOutputs(client, stateVersionId);
    setOutputs(outputs, desiredOutputs);
  } catch (err) {
    console.error(err.message);
    core.setFailed(err.message);
  }
}

run();
