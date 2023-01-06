# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.1](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.30...v1.0.1) (2023-01-06)

First stable release. No new features or bug fixes.

### [0.1.30](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.29...v0.1.30) (2023-01-02)


### Features

* allow filtering with no votes ([75816ed](https://github.com/drodil/backstage-plugin-qeta/commit/75816eddf08977769fb6bbbf19d88de05922e374)), closes [#4](https://github.com/drodil/backstage-plugin-qeta/issues/4)
* remember filter panel options ([e96e6c2](https://github.com/drodil/backstage-plugin-qeta/commit/e96e6c26468d82d8c9396e3f17d70788eb888924)), closes [#15](https://github.com/drodil/backstage-plugin-qeta/issues/15)


### Bug Fixes

* export QetaApi for external use ([858574d](https://github.com/drodil/backstage-plugin-qeta/commit/858574d1fadda3b045cf18d999ed4d75e408e614))

### [0.1.29](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.28...v0.1.29) (2023-01-02)


### Features

* allow setting entity to ask in URL param ([b85fcb4](https://github.com/drodil/backstage-plugin-qeta/commit/b85fcb4fd00ee2b072483ac07b98fbb801818b03))

### [0.1.28](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.27...v0.1.28) (2023-01-02)


### Features

* allow ask form to have callback after posting question ([0477176](https://github.com/drodil/backstage-plugin-qeta/commit/04771765e66147e8a5bb2f52fa73f03ee6c55afb))
* allow editing of answers ([93d4870](https://github.com/drodil/backstage-plugin-qeta/commit/93d4870d4720dc12178671dfbde1588945fa3832)), closes [#5](https://github.com/drodil/backstage-plugin-qeta/issues/5)
* allow filtering entity kinds with config ([66a4ddb](https://github.com/drodil/backstage-plugin-qeta/commit/66a4ddb5fce0fe54c45ff929a0ce6eda6632cdc4)), closes [#18](https://github.com/drodil/backstage-plugin-qeta/issues/18) [#17](https://github.com/drodil/backstage-plugin-qeta/issues/17)


### Bug Fixes

* change the components to entities ([c42943e](https://github.com/drodil/backstage-plugin-qeta/commit/c42943e7c1e59947919f6218a4d976127e566a8a))
* references to components ([29a0580](https://github.com/drodil/backstage-plugin-qeta/commit/29a0580e62ca54af1edede7e25b58ca13544f0b8))

### [0.1.27](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.26...v0.1.27) (2022-12-30)


### Features

* allow specifying component for ask form ([45c7123](https://github.com/drodil/backstage-plugin-qeta/commit/45c7123ff5ab5909e08283f886e654e0a944ecb3))


### Bug Fixes

* show total number of questions in question container ([1281b60](https://github.com/drodil/backstage-plugin-qeta/commit/1281b60fde382ecd2fa55afe592cb6f1f6692907))

### [0.1.26](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.23...v0.1.26) (2022-12-30)


### Bug Fixes

* no new question when editing ([9c76dad](https://github.com/drodil/backstage-plugin-qeta/commit/9c76dad9aeb22ec5c639e4b6f82a2195067eec6d))
* add missing mock for question update ([8d1f7c7](https://github.com/drodil/backstage-plugin-qeta/commit/8d1f7c711f130791cfd459402cd4772b11f6e35c))
* change the search collator to only return answer contents ([32a3833](https://github.com/drodil/backstage-plugin-qeta/commit/32a3833d4918e1e38fcbb2e846012baf078f246d))
* delete button to be a link ([dbce2be](https://github.com/drodil/backstage-plugin-qeta/commit/dbce2be182f890a2f9d5b14706cb346b7922ca9c))
* vote buttons tooltip for questions ([95fa77c](https://github.com/drodil/backstage-plugin-qeta/commit/95fa77c45fbfed2bce149f8cc48e1c30bad70b5b))
* add margin to top buttons and fix search docs ([cf30db5](https://github.com/drodil/backstage-plugin-qeta/commit/cf30db51fd97b7b31524e8d4b07d63ceb29e5f05))


### Feature**s**

* allow deleting questions and answers ([e06c0e7](https://github.com/drodil/backstage-plugin-qeta/commit/e06c0e73b56aeead90b1b58f88b3321ac7f215f1)), closes [#6](https://github.com/drodil/backstage-plugin-qeta/issues/6)
* allow fetching questions by component ([e68767d](https://github.com/drodil/backstage-plugin-qeta/commit/e68767db6b418f7bc1ba73d6764f8519a1b5f2a0))
* allow users to edit questions ([e8a15dd](https://github.com/drodil/backstage-plugin-qeta/commit/e8a15dd91239b650b3f3c8211ef3a3c14db760b7)), closes [#5](https://github.com/drodil/backstage-plugin-qeta/issues/5)


### [0.1.23](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.22...v0.1.23) (2022-12-29)


### Bug Fixes

* change search collator to use database ([4b08cb3](https://github.com/drodil/backstage-plugin-qeta/commit/4b08cb31fb3bb94f96038c91e06040a931b0b9c1))

### [0.1.22](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.21...v0.1.22) (2022-12-28)


### Features

* format username from entity reference ([5b81ddb](https://github.com/drodil/backstage-plugin-qeta/commit/5b81ddbae37ea9a5afa3b5e9f7d77bbedc0d485f)), closes [#14](https://github.com/drodil/backstage-plugin-qeta/issues/14)


### Bug Fixes

* move catalog api to dev/index ([38c34f9](https://github.com/drodil/backstage-plugin-qeta/commit/38c34f9cac64f0a9bbd2357463d83e241e9244f8)), closes [#16](https://github.com/drodil/backstage-plugin-qeta/issues/16)

### [0.1.21](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.18...v0.1.21) (2022-12-28)


### Bug Fixes

* remove catalog api completely from released version ([61ed863](https://github.com/drodil/backstage-plugin-qeta/commit/61ed8632e88912837ddbe91e736e2c4b128e2425))
* duplicate catalog api for plugin users ([2ce629b](https://github.com/drodil/backstage-plugin-qeta/commit/2ce629ba777f9ea98301e0f14ee82086ca747912))
* yarn.lock ([639d2ab](https://github.com/drodil/backstage-plugin-qeta/commit/639d2abfb8a762c663bf767f7e7d160d12eff6f1))

### Features

* allow selecting components for questions ([7c2ca39](https://github.com/drodil/backstage-plugin-qeta/commit/7c2ca398a61333433630a80753e3df64de1f2102)), closes [#12](https://github.com/drodil/backstage-plugin-qeta/issues/12)


### [0.1.18](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.17...v0.1.18) (2022-12-27)


### Features

* allow using postgresql in local dev ([92c9651](https://github.com/drodil/backstage-plugin-qeta/commit/92c96511ad2524376961db687094eca0a46838b5))

### [0.1.17](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.16...v0.1.17) (2022-12-27)


### Bug Fixes

* remove docker from tests ([c658f60](https://github.com/drodil/backstage-plugin-qeta/commit/c658f60f6cf473dfa121fe29c06dc07c3e7db658))

### [0.1.16](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.15...v0.1.16) (2022-12-27)


### Features

* add button to ask when there is no questions ([1aa4d75](https://github.com/drodil/backstage-plugin-qeta/commit/1aa4d75fa5288fe8fe6954baddc5981a252cb16a))
* add question highlight lists to front page ([00f32c5](https://github.com/drodil/backstage-plugin-qeta/commit/00f32c5c85ef2fbc973f41770926cbdd42774405)), closes [#3](https://github.com/drodil/backstage-plugin-qeta/issues/3)


### Bug Fixes

* correct answer fetching in the questions list ([7bd3daf](https://github.com/drodil/backstage-plugin-qeta/commit/7bd3daf4edc81c8ef4d88c3ec2976dd5337b1d85))

### [0.1.15](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.14...v0.1.15) (2022-12-27)


### Features

* add tags page to show all used tags ([b3a0b6f](https://github.com/drodil/backstage-plugin-qeta/commit/b3a0b6f3fcd8cd4b1da9833361455f68c49675c5)), closes [#2](https://github.com/drodil/backstage-plugin-qeta/issues/2)
* initial filter panel for questions page ([3852032](https://github.com/drodil/backstage-plugin-qeta/commit/385203275802b65e8ee9c38ddfdc915326ef0135)), closes [#4](https://github.com/drodil/backstage-plugin-qeta/issues/4)


### Bug Fixes

* follow palette colors in markdown editor ([9756685](https://github.com/drodil/backstage-plugin-qeta/commit/9756685f584f549948571369bdeb6dd296b1fa8e))

### [0.1.14](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.13...v0.1.14) (2022-12-23)


### Features

* add standard-release for version bumping ([a4c802e](https://github.com/drodil/backstage-plugin-qeta/commit/a4c802e1a5fdf643b1bd8643ed8f38a161548ea5)), closes [#11](https://github.com/drodil/backstage-plugin-qeta/issues/11)
* automatic release creation when tag pushed ([59a84a0](https://github.com/drodil/backstage-plugin-qeta/commit/59a84a08af0c0aa43cb9380d8fc22a4b67801442))
* use version bump in release workflow ([0773dfc](https://github.com/drodil/backstage-plugin-qeta/commit/0773dfca0e3c3ebfdefa68a25ce6e21c30ddcce3)), closes [#11](https://github.com/drodil/backstage-plugin-qeta/issues/11)


### Bug Fixes

* add missing trigger to bump ([efc383d](https://github.com/drodil/backstage-plugin-qeta/commit/efc383dda3daaa69e4c99b3affbcfd15b764eb7f))
* checkout in release pipeline to fetch tags ([6fdcf51](https://github.com/drodil/backstage-plugin-qeta/commit/6fdcf51ab91b7fd616f25c34b83ccce4747bc484))
* move version bump to own action ([0154d87](https://github.com/drodil/backstage-plugin-qeta/commit/0154d870c1601e1c9c0923d97521d60f6e861465))
* run lint and tests before bump ([a3ee727](https://github.com/drodil/backstage-plugin-qeta/commit/a3ee72731eb7c28584aba182b2495695d472d727))
* try to fix navigation once again ([46aeeb1](https://github.com/drodil/backstage-plugin-qeta/commit/46aeeb1b1cc2a51cd80cd77f7ef760ee7e866e97))
