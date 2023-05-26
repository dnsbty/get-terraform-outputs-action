# Get Terraform Cloud Outputs Action

This action gets the outputs from the latest state version in the specified
Terraform Cloud workspace, and outputs them for use in your Github Actions
workflows.

## Inputs

### `api-token`

**Required** The API token that should be used.

### `workspace-id`

**Required** The ID of the Terraform Cloud workspace.

### `outputs`

**Required** A multiline string containing the names of the outputs you want to get.

## Outputs

All outputs of this action are dynamic, and will match the output names that you
provide in the `outputs` input. An error will be displayed for any outputs that
aren't found in Terraform Cloud, and those outputs will be returned empty, but
all other outputs can be used as normal.

## Example usage

```yaml
uses: dnsbty/get-terraform-outputs-action@v1
with:
  api-token: ${{ secrets.TF_API_TOKEN }}
  workspace-id: ws-MB8LQIK8Cxksuvao
  outputs: |
    gh_actions_role
    repository_url
    task_definition_arn
```
