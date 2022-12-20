# Contributing Guidelines

`backstage-plugin-qeta` is [MIT licensed](LICENSE) and accepts contributions via
GitHub pull requests. This document outlines some of the conventions on
development workflow, commit message formatting, contact points, and other
resources to make it easier to get your contribution accepted.

Contributions are welcome, and they are greatly appreciated! Every little bit helps, and credit will always be given. ❤️

## Support Channels

The official support channels, for both users and contributors, are:

- GitHub [issues](https://github.com/drodil/backstage-plugin-qeta/issues)

## How to Contribute

Pull Requests (PRs) are the main and exclusive way to contribute to the project.

## Local setup

### Create a fork

[Fork][fork], then clone the repository:

```
git clone git@github.com:your_github_username/backstage-plugin-qeta.git
cd dark
git remote add upstream https://github.com/drodil/backstage-plugin-qeta.git
git fetch upstream
```

### Install dependencies

```
yarn install
```

### Run the plugins locally

A standalone development version of both the frontend and backend plugins are included in this repository.
They can be started as follows:

```
yarn dev # starts both the frontend and the backend in parallel
yarn start # starts the frontend only
yarn start-backend # starts the backend only
```

## Making Changes

Start by creating a new branch for your changes:

```
git checkout main
git fetch upstream
git rebase upstream/main
git checkout -b new-feature
```

Make your changes, then ensure that `yarn lint` and `yarn test` still pass. If you're satisfied with your changes, push them to your fork.

```
git push origin new-feature
```

Then use the GitHub UI to open a pull request.

Your changes are much more likely to be approved if you:

- add tests for new functionality
- write a [good commit message][commit-message]
- maintain backward compatibility
