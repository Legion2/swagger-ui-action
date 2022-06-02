# Swagger UI Action [![build-test](https://github.com/Legion2/swagger-ui-action/workflows/build-test/badge.svg)](https://github.com/Legion2/swagger-ui-action/actions?query=workflow%3Abuild-test+branch%3Amain)
Generate Swagger UI static html files and configuration to be deployed to GitHub Pages.

> This action only works on linux runners.
## How to Use
This Action supports four different configuration modes:
 * `spec-file`: File path to local OpenAPI or Swagger specification document
 * `spec-url`: URL of an OpenAPI or Swagger specification document
 * `swagger-config-file`: File path to local swagger configuration file
 * `swagger-config-url`: URL of a swagger configuration file

Use `spec-file` or `spec-url` when you have an OpenAPI or Swagger specification document and want a basic Swagger UI generated for it.
If you want to customize the created Swagger UI, you should use the `swagger-config-file` or the `swagger-config-url` configuration modes.
For information about the advanced swagger-config see the [Swagger UI Configuration documentation](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/).

Note that, if `swagger-config-file` or `swagger-config-url` are used, no files specified in the `swagger-config.yaml` are copied by this action.
In this case, it is your responsibility to copy required files such as the OpenAPI document where you need them (output directory).

The output directory of the generated Swagger UI must be set with the `output` argument of the Action.
Optionally the Swagger UI version can be set with the `version` input, it accepts semver ranges.

### Example
This Action only generates the Swagger UI.
For example, to deploy it to GitHub Pages another Action is required.

Example steps from a workflow to generate and deploy Swagger UI to GitHub Pages:
```yaml
      - name: Generate Swagger UI
        uses: Legion2/swagger-ui-action@v1
        with:
          output: swagger-ui
          spec-file: openapi.json
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: swagger-ui
```

For a full example have a look at [this workflow file](https://github.com/Legion2/open-cue-service/blob/master/.github/workflows/pages.yml).

## Development

The Action runs from GitHub this repo, so the packed dist folder must be added to git. 

Release a new version:
```bash
$ npm run package
$ git commit -a -m "distribution"
$ npm version major/minor/patch
$ git push
$ git tag -fa v1 -m "Update v1 tag"
$ git push origin v1 --force
```

Then create a release on GitHub.

[versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
