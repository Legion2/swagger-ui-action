# Swagger UI Action [![build-test](https://github.com/Legion2/swagger-ui-action/workflows/build-test/badge.svg)](https://github.com/Legion2/swagger-ui-action/actions?query=workflow%3Abuild-test+branch%3Amain)
Generate Swagger UI static html files and configuration to be deployed to GitHub Pages.

> This action only works on linux runners.
## How to Use

Have a look at [action.yml](action.yml) for a complete list of all supported input options.

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

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
