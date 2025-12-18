# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.48.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.47.2...v3.48.0) (2025-12-18)


### Features

* bulk fetching of entities from db ([3a56fb9](https://github.com/drodil/backstage-plugin-qeta/commit/3a56fb9a335645ab4f2fb30493723bb5fc52a0b9))
* cache views and votes for q&a ([690e7ef](https://github.com/drodil/backstage-plugin-qeta/commit/690e7efb4fa32123a22f363f3b5cd7b1a01cedf7))
* more db improvements ([0213e34](https://github.com/drodil/backstage-plugin-qeta/commit/0213e34fa1978fd4e1c1c5120ae9fb7dd0c036a6))
* refactor database to separate stores ([854f4c6](https://github.com/drodil/backstage-plugin-qeta/commit/854f4c6859a20a3e6ae76cfefa316c7edbd711d7))


### Bug Fixes

* collection handling ([6a61067](https://github.com/drodil/backstage-plugin-qeta/commit/6a6106725825f52b1ef05cb4ca9426da42728b5e))
* permission checks for all entities/tags ([ef7aef5](https://github.com/drodil/backstage-plugin-qeta/commit/ef7aef56710d235ba825182d7c0d784633984c04))
* trend calculation with cache columns ([eba4063](https://github.com/drodil/backstage-plugin-qeta/commit/eba4063ff1b3ed8fc87aa1d52e9ba825c594fb93))

### [3.47.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.47.1...v3.47.2) (2025-12-15)


### Bug Fixes

* remove npm token from publish ([2c85032](https://github.com/drodil/backstage-plugin-qeta/commit/2c85032f97ba29f88e84a5fa13c108aa95442123))

### [3.47.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.47.0...v3.47.1) (2025-12-15)

## [3.47.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.46.1...v3.47.0) (2025-12-15)


### Features

* fill suggestions with random posts when not enough real ones ([ead28e0](https://github.com/drodil/backstage-plugin-qeta/commit/ead28e095ded3e51f0836bdcf4a1ea831c90868a))


### Bug Fixes

* add self link to resources ([d68371b](https://github.com/drodil/backstage-plugin-qeta/commit/d68371b877b53cc8f083b4525d7ac6d047276808))
* tests for notification links ([e4b2f72](https://github.com/drodil/backstage-plugin-qeta/commit/e4b2f7235d1a53b8b2ea3961ddcef81bd42fc2dc))

### [3.46.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.46.0...v3.46.1) (2025-12-12)


### Bug Fixes

* notifications for custom routes ([d3495b9](https://github.com/drodil/backstage-plugin-qeta/commit/d3495b9165a8ce6e1cff6aa52a6ffd0f9533c6c5))

## [3.46.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.45.2...v3.46.0) (2025-12-08)


### Features

* add entity permission filtering ([#363](https://github.com/drodil/backstage-plugin-qeta/issues/363)) ([0be8cbc](https://github.com/drodil/backstage-plugin-qeta/commit/0be8cbcf8313539f4988fa722d2e0735f0239c4f))
* add prominent "Leave a comment" button to articles ([8d656e0](https://github.com/drodil/backstage-plugin-qeta/commit/8d656e0d174281c1b89bc6800a44903994d518be))
* add published date field for articles ([#365](https://github.com/drodil/backstage-plugin-qeta/issues/365)) ([4cf50da](https://github.com/drodil/backstage-plugin-qeta/commit/4cf50da5bfa06d136ae6aad91e315b287f0d8364))
* add published date field for articles ([#365](https://github.com/drodil/backstage-plugin-qeta/issues/365)) ([be0ebb8](https://github.com/drodil/backstage-plugin-qeta/commit/be0ebb8295db438506106c8441a4fa648373ff70))
* add question title to notification descriptions for answers and comments ([330a2a2](https://github.com/drodil/backstage-plugin-qeta/commit/330a2a2519a3d2480fd51c0f9a9373edcb5d2424))
* small ui tuning ([d6c0d3c](https://github.com/drodil/backstage-plugin-qeta/commit/d6c0d3cdecaeac625d80781f075ecd6365f39a44))


### Bug Fixes

* enable entity information in permission rules ([5274a5f](https://github.com/drodil/backstage-plugin-qeta/commit/5274a5f22999c49929972efaea259852f28a8097))

### [3.45.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.45.1...v3.45.2) (2025-11-20)


### Bug Fixes

* remove permission batching ([7f2f339](https://github.com/drodil/backstage-plugin-qeta/commit/7f2f339b28e244557cb418084437adc20f998a8e))

### [3.45.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.45.0...v3.45.1) (2025-11-20)


### Bug Fixes

* answer access rights mixed up if using permissions ([988c2e8](https://github.com/drodil/backstage-plugin-qeta/commit/988c2e86681866550b3855e3220a1134f9313c12))

## [3.45.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.44.0...v3.45.0) (2025-11-19)


### Features

* improve list styling ([b4b9d10](https://github.com/drodil/backstage-plugin-qeta/commit/b4b9d10bed039368fbc9834daa22248ca037b868))
* show comments count in post grid ([b03fea9](https://github.com/drodil/backstage-plugin-qeta/commit/b03fea961f5b7f61ba7d102613c9b4b1b852742c)), closes [#356](https://github.com/drodil/backstage-plugin-qeta/issues/356)


### Bug Fixes

* article layout on big screens ([100ac48](https://github.com/drodil/backstage-plugin-qeta/commit/100ac4895a80e61d3ab0d7da25a3c1b2bc890438)), closes [#355](https://github.com/drodil/backstage-plugin-qeta/issues/355)
* is moderator destructor in answer form ([35b6923](https://github.com/drodil/backstage-plugin-qeta/commit/35b6923e20311a5b0b7265c507093f7a0ed92f43))

## [3.44.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.43.0...v3.44.0) (2025-11-18)


### Features

* add permanent deletion flag for posts and answers ([df3367a](https://github.com/drodil/backstage-plugin-qeta/commit/df3367ad7e95a56b90fe7e463f5e310a40c5f906))
* combine conditionals on routes ([13f9fba](https://github.com/drodil/backstage-plugin-qeta/commit/13f9fba61e702525a42ade18cb5c01183008a037))


### Bug Fixes

* **style:** improve inline display handling for comment content ([a326377](https://github.com/drodil/backstage-plugin-qeta/commit/a3263779a084594c5f67da115e1fb1f1ab5c0544))

## [3.43.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.42.1...v3.43.0) (2025-11-13)


### Features

* add entity suggestions to post form ([ff43a9a](https://github.com/drodil/backstage-plugin-qeta/commit/ff43a9a3ea354ea19168215f6dbe6764610fd24a)), closes [#307](https://github.com/drodil/backstage-plugin-qeta/issues/307)
* allow defining static notification receivers ([41f275e](https://github.com/drodil/backstage-plugin-qeta/commit/41f275e4f72864d99e7abeba28b167cb07bcfe6f)), closes [#354](https://github.com/drodil/backstage-plugin-qeta/issues/354)


### Bug Fixes

* events to use post instead question in payload ([24e46d6](https://github.com/drodil/backstage-plugin-qeta/commit/24e46d62afbcf9d85a3e666efe4cadeb60885aa1))

### [3.42.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.42.0...v3.42.1) (2025-11-05)


### Bug Fixes

* make urls and descriptions able to handle more than 255 chars ([cb33d6e](https://github.com/drodil/backstage-plugin-qeta/commit/cb33d6e1399040dc7568026553ee3260bcb8f219))
* tag page change not updating posts ([cdbca6a](https://github.com/drodil/backstage-plugin-qeta/commit/cdbca6a75e2e12fb7565bd9792b0c789d87a3db9)), closes [#349](https://github.com/drodil/backstage-plugin-qeta/issues/349)
* unique_authors migration ([39f0ee2](https://github.com/drodil/backstage-plugin-qeta/commit/39f0ee2904959d217b4892b20aed7a355e19c714))

## [3.42.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.7...v3.42.0) (2025-10-30)


### Features

* add techdocs addon for asking questions about content ([cd70b53](https://github.com/drodil/backstage-plugin-qeta/commit/cd70b5353c70e51fc9715357c95c4d1b5b152e07))

### [3.41.7](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.6...v3.41.7) (2025-10-28)


### Bug Fixes

* rollback to getEntities ([d42451f](https://github.com/drodil/backstage-plugin-qeta/commit/d42451f2805e683e81b22f79ee850386ecafef6a))

### [3.41.6](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.5...v3.41.6) (2025-10-28)


### Bug Fixes

* use queryentities in entities input ([bc2b037](https://github.com/drodil/backstage-plugin-qeta/commit/bc2b0377e4b9d1475e087aa568291fce947a7f25))

### [3.41.5](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.4...v3.41.5) (2025-10-28)


### Bug Fixes

* handle entities loading on demand ([ecc9a4f](https://github.com/drodil/backstage-plugin-qeta/commit/ecc9a4fb57d7343d2cebe2f34d95eb8ecb73c3b6)), closes [#350](https://github.com/drodil/backstage-plugin-qeta/issues/350) [#351](https://github.com/drodil/backstage-plugin-qeta/issues/351)

### [3.41.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.3...v3.41.4) (2025-10-24)


### Bug Fixes

* add missing secret visibility in config ([ee766b9](https://github.com/drodil/backstage-plugin-qeta/commit/ee766b960d3f45adcfdd064074d4c629d3947fce))

### [3.41.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.2...v3.41.3) (2025-10-15)


### Bug Fixes

* scaffolder import ([de464c0](https://github.com/drodil/backstage-plugin-qeta/commit/de464c04a41d9408be7a8bada2eff988e6bb248a))

### [3.41.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.1...v3.41.2) (2025-10-14)


### Bug Fixes

* sort entities and tags in inputs ([c4c678c](https://github.com/drodil/backstage-plugin-qeta/commit/c4c678cfa2a4e48d9305c30547c014ec71916493))

### [3.41.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.41.0...v3.41.1) (2025-10-14)


### Bug Fixes

* posts container properties ([929d43b](https://github.com/drodil/backstage-plugin-qeta/commit/929d43b4751e7a884980f48a85e4db28636016d4)), closes [#333](https://github.com/drodil/backstage-plugin-qeta/issues/333)
* show loading state correctly in posts table ([60b14c8](https://github.com/drodil/backstage-plugin-qeta/commit/60b14c8bcc9b233931deb0ea35fd5500aceb95b5))

## [3.41.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.40.1...v3.41.0) (2025-10-13)


### Features

* allow moderators to modify answer author ([15eb38f](https://github.com/drodil/backstage-plugin-qeta/commit/15eb38f027f5f9056b9fbba9c821f7604508062e)), closes [#328](https://github.com/drodil/backstage-plugin-qeta/issues/328)
* allow moderators to modify post authors ([ef0d58a](https://github.com/drodil/backstage-plugin-qeta/commit/ef0d58a6dd6983f3544b61bce0bc472f124de38e)), closes [#328](https://github.com/drodil/backstage-plugin-qeta/issues/328)
* allow passing markdown plugins via props ([766012c](https://github.com/drodil/backstage-plugin-qeta/commit/766012ce29900c82d66fc6a10b8b7d912657b2da))


### Bug Fixes

* restore user field for metadatainput ([adfd7fa](https://github.com/drodil/backstage-plugin-qeta/commit/adfd7fa14dffd5f6cbd8fda7aaf99403220a0488))
* tsc errors with entities input ([5899045](https://github.com/drodil/backstage-plugin-qeta/commit/5899045885a68c6f72d6c70eb5237ba518025536))

### [3.40.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.40.0...v3.40.1) (2025-10-10)


### Bug Fixes

* change to rehype plugin instead remark ([c02a1b3](https://github.com/drodil/backstage-plugin-qeta/commit/c02a1b3e7ff839dfe4654d84db6afa8da718640b))

## [3.40.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.39.1...v3.40.0) (2025-10-10)


### Features

* support mermaid in markdown content ([d47f669](https://github.com/drodil/backstage-plugin-qeta/commit/d47f669bd176300b35afec602b04ef7d4ed5619a)), closes [#347](https://github.com/drodil/backstage-plugin-qeta/issues/347)


### Bug Fixes

* user group to use display name if available ([b539641](https://github.com/drodil/backstage-plugin-qeta/commit/b539641281605a01ba32c7dbd325a344c3d841b0))

### [3.39.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.39.0...v3.39.1) (2025-10-07)


### Bug Fixes

* update 'url' column in 'posts' table to use text type ([1665d60](https://github.com/drodil/backstage-plugin-qeta/commit/1665d60b19cdfdc44c3685326fd9aaa2efdc2148)), closes [#341](https://github.com/drodil/backstage-plugin-qeta/issues/341)
* update LinkPage title structure with Typography ([dfff83d](https://github.com/drodil/backstage-plugin-qeta/commit/dfff83d1546c23562d07e3625b6402d545313622))

## [3.39.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.38.2...v3.39.0) (2025-09-30)


### Features

* add comment actions to actions registry ([5baeb3a](https://github.com/drodil/backstage-plugin-qeta/commit/5baeb3ae172d5f613b88c08eb2e54a11f84bb3f8))


### Bug Fixes

* entity kind filter to work with right config ([b9cff08](https://github.com/drodil/backstage-plugin-qeta/commit/b9cff08aa4b34bec46c75ff17827554d4d822557))

### [3.38.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.38.1...v3.38.2) (2025-09-30)


### Bug Fixes

* **nfs:** add missing search filter types ([ff29b5d](https://github.com/drodil/backstage-plugin-qeta/commit/ff29b5d85d659b1da6e8e238bd0f173cacc8aca9))
* search result item to show up properly ([cd7b986](https://github.com/drodil/backstage-plugin-qeta/commit/cd7b986588c5f5bcc78b836d1751644f54685389))

### [3.38.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.38.0...v3.38.1) (2025-09-30)


### Bug Fixes

* metadata extraction error logging ([f20fdbd](https://github.com/drodil/backstage-plugin-qeta/commit/f20fdbdd1a10c45e72b5d49ee561e1a172007185))

## [3.38.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.37.1...v3.38.0) (2025-09-26)


### Features

* cache url metadata ([cc1724c](https://github.com/drodil/backstage-plugin-qeta/commit/cc1724ceb68b850ceed1ff470d9c02e94a1b5c9e))
* fetch favicon from backend ([9ec6102](https://github.com/drodil/backstage-plugin-qeta/commit/9ec6102b5c8eb1b8e0ae4c1b9b00325ec47767a9))
* make frontend fetch favicon from backend ([ed085fa](https://github.com/drodil/backstage-plugin-qeta/commit/ed085fa192d9ef16e7d4c3bd8872623d66930b71))


### Bug Fixes

* add blueprints for easier override of extra page elements ([2ad9998](https://github.com/drodil/backstage-plugin-qeta/commit/2ad999858b6d81921ab988ce58db5d27d053d607))
* prioritise common favicon location over html link tags ([d3f7b5a](https://github.com/drodil/backstage-plugin-qeta/commit/d3f7b5a731d282e6258a89973beab18822fa595c))

### [3.37.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.37.0...v3.37.1) (2025-09-24)


### Bug Fixes

* **nfs:** only show entity content for configured kinds ([b4fea35](https://github.com/drodil/backstage-plugin-qeta/commit/b4fea352c191f216eecfccf46418b421a70c5135))
* show users posts instead related to user in entity post content ([6dee735](https://github.com/drodil/backstage-plugin-qeta/commit/6dee73591c0b949ebfcdcc99adc6fff059fdd8e1))

## [3.37.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.36.3...v3.37.0) (2025-09-23)


### Features

* **nfs:** add support for configuring extensions ([c739053](https://github.com/drodil/backstage-plugin-qeta/commit/c73905385c629ea48931ae853405b68c8370678a))

### [3.36.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.36.2...v3.36.3) (2025-09-22)


### Bug Fixes

* hide images where they cannot load ([e47d2ac](https://github.com/drodil/backstage-plugin-qeta/commit/e47d2ac19cd9ce969eeccba232990e357a10f7d6))
* use link icon if favicon fails to load ([3557fa7](https://github.com/drodil/backstage-plugin-qeta/commit/3557fa750f5af280b85311810b3171407d3baeac))

### [3.36.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.36.1...v3.36.2) (2025-09-22)


### Bug Fixes

* catalog module bump ([add3d30](https://github.com/drodil/backstage-plugin-qeta/commit/add3d30a890fddda4a28a891a308faf992af31ae))

### [3.36.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.36.0...v3.36.1) (2025-09-20)


### Bug Fixes

* catalog module missing script ([053eed4](https://github.com/drodil/backstage-plugin-qeta/commit/053eed46c5a4a022955251b755a9d091a94c4f07))

## [3.36.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.35.2...v3.36.0) (2025-09-20)


### Features

* add missing links to HighLightPosts ([6d8e114](https://github.com/drodil/backstage-plugin-qeta/commit/6d8e1146043b99b98e3c5761dc14a08693383fc9))
* auto-fetch of metadata ([46021ee](https://github.com/drodil/backstage-plugin-qeta/commit/46021ee7f80931bc6dc52eff970f4ae85a05e859))
* catalog link processor added ([9f40cb8](https://github.com/drodil/backstage-plugin-qeta/commit/9f40cb811c70824dfc5515dd2f105d3397ba3351))
* click counting of links ([6c9a527](https://github.com/drodil/backstage-plugin-qeta/commit/6c9a527ca25b105ae5e9315910d82c457bcdf655))
* drafts/edits of links is possible ([b7b57be](https://github.com/drodil/backstage-plugin-qeta/commit/b7b57be0e889677c9df2782b39961160b8030ec8))
* extend backend for new post type link ([647cf03](https://github.com/drodil/backstage-plugin-qeta/commit/647cf03c554c60a92f58ad5ffc668092f15d6d4c))
* improve security when auto-fetching metadata ([77483ce](https://github.com/drodil/backstage-plugin-qeta/commit/77483ce8cd4eb46ca316b69a6e296fc8680f9bdd))
* link post statistics ([41990bb](https://github.com/drodil/backstage-plugin-qeta/commit/41990bbcfedcc3f244c85a62a7a4b9ab157a0c54))
* link UI is consistent and fits in with rest ([835e518](https://github.com/drodil/backstage-plugin-qeta/commit/835e518dab9dc941ada6da0609d0f5a6c13f1d3d))
* more options to click links for better UX ([ac881a0](https://github.com/drodil/backstage-plugin-qeta/commit/ac881a0da331b87ba16c38d2d1f51fbf4610bd56))
* restore link functionality ([50ef544](https://github.com/drodil/backstage-plugin-qeta/commit/50ef544e91411ae61a900dca5ff6585c49398e18))
* show og:image for links if available ([2e1316b](https://github.com/drodil/backstage-plugin-qeta/commit/2e1316bcb9bc3abd02eb9127456dc4ef897035d2))
* showLinkButton functionality like showAskButton ([48df1ae](https://github.com/drodil/backstage-plugin-qeta/commit/48df1ae13aa8db2997380257ecc4b4e18d28d53a))
* simple UI to create/view links ([ebc5831](https://github.com/drodil/backstage-plugin-qeta/commit/ebc58315677884ff167fe6a79f943e13e76d29f7))
* suggestion functionality for links ([1d1bb6d](https://github.com/drodil/backstage-plugin-qeta/commit/1d1bb6df26d8f359166b92f4d1a74f92afd47130))
* support notifications for links ([1cce399](https://github.com/drodil/backstage-plugin-qeta/commit/1cce399e8ab72dacb29c4c476b3475401e6ffb15))
* tweak placement of clickable elements of links ([f2b0efa](https://github.com/drodil/backstage-plugin-qeta/commit/f2b0efac3e02bb57661646526ac6acdc6ca258d3))
* visible error if new link is invalid ([1777fcd](https://github.com/drodil/backstage-plugin-qeta/commit/1777fcd9657f14b9efd61ac11ead09542e139bf0))


### Bug Fixes

* add link route to missed case distinctions ([2e36c35](https://github.com/drodil/backstage-plugin-qeta/commit/2e36c355f253e960dbfee90ebd047d97233139f1))
* autosave does not save empty url for link ([b69ec69](https://github.com/drodil/backstage-plugin-qeta/commit/b69ec6998660d077b0a056a9b97926c0c85ea726))
* catalog module package.json lint issue ([726e783](https://github.com/drodil/backstage-plugin-qeta/commit/726e7831dfc98be2b38b8621e8e5af36ece5bf2e))
* content of link post can be empty ([f727e98](https://github.com/drodil/backstage-plugin-qeta/commit/f727e985872e2e23f823a6906dcccc65709cd847))
* database null handling ([d4757d9](https://github.com/drodil/backstage-plugin-qeta/commit/d4757d9e6438a7f422d3a6994d91c66185acf546))
* database tests for undefined url ([b1b50b0](https://github.com/drodil/backstage-plugin-qeta/commit/b1b50b0877834b5f4d24f5c64e154e87b90261cc))
* filter out old qeta links in processor ([381a87d](https://github.com/drodil/backstage-plugin-qeta/commit/381a87d027a4cc2ad9b044b48079aaae2b3d542b))

### [3.35.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.35.1...v3.35.2) (2025-09-18)


### Bug Fixes

* handle undefined tags in body correctly ([7e24c7c](https://github.com/drodil/backstage-plugin-qeta/commit/7e24c7c591440f6033fa004c48833c4c1150c3ce))

### [3.35.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.35.0...v3.35.1) (2025-09-16)

## [3.35.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.34.0...v3.35.0) (2025-09-03)


### Features

* notification receivers extension point ([74c2f6e](https://github.com/drodil/backstage-plugin-qeta/commit/74c2f6efb32e00deeeea4c7e8913615a9d3aa24b))

## [3.34.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.33.4...v3.34.0) (2025-09-01)


### Features

* add loading spinner to answer form submit ([8577c25](https://github.com/drodil/backstage-plugin-qeta/commit/8577c25d1c665f240a307b0516c1ee34c6a3fcf4))
* add spacing to save button ([66dd3cd](https://github.com/drodil/backstage-plugin-qeta/commit/66dd3cdb37530041dcf6b4f71ca40b4ecdc6e281))
* initial actions registry support ([5cd6bea](https://github.com/drodil/backstage-plugin-qeta/commit/5cd6bea8ac21818738e0e5d1436cd3bb424dff3e)), closes [#314](https://github.com/drodil/backstage-plugin-qeta/issues/314)


### Bug Fixes

* actions attributes ([ccf1b88](https://github.com/drodil/backstage-plugin-qeta/commit/ccf1b88ba6fbc44750195b217b03b6d421c2abb4))

### [3.33.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.33.3...v3.33.4) (2025-08-27)

### [3.33.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.33.2...v3.33.3) (2025-08-22)


### Bug Fixes

* invalid translation for question author boxes ([f6ab1a0](https://github.com/drodil/backstage-plugin-qeta/commit/f6ab1a013062f07f0255d30475e9ae9fa0289611))

### [3.33.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.33.1...v3.33.2) (2025-08-20)

### [3.33.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.33.0...v3.33.1) (2025-08-20)


### Bug Fixes

* replace fs.rename with fs.copyFile and fs.unlink to avoid EXDEV errors ([7ddab83](https://github.com/drodil/backstage-plugin-qeta/commit/7ddab8356a5e6af0a0eee1ec3809bdf63d11ce3b))
* replace fs.rename with fs.copyFile and fs.unlink to avoid EXDEV errors ([ebeb85b](https://github.com/drodil/backstage-plugin-qeta/commit/ebeb85b9810d76c8d9dda6ed246756fd525f9542))
* repo fix ([7a6f0f4](https://github.com/drodil/backstage-plugin-qeta/commit/7a6f0f4d832fc8628164161dba7b2bbb0555efd4))

## [3.33.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.32.1...v3.33.0) (2025-08-01)


### Features

* add translations for markdown editor ([7cf5add](https://github.com/drodil/backstage-plugin-qeta/commit/7cf5add94da601ebd51bfd75450cfd22f7faf701))
* notify author on deletion ([b834fd5](https://github.com/drodil/backstage-plugin-qeta/commit/b834fd5c714285d50b87b4676d74cea92c433cbd)), closes [#312](https://github.com/drodil/backstage-plugin-qeta/issues/312)


### Bug Fixes

* avoid querying when no kinds are enabled ([1dde8b9](https://github.com/drodil/backstage-plugin-qeta/commit/1dde8b935f39b6204c2eb256ff93261221726f5d))
* do not send notifications for draft posts ([6b687a5](https://github.com/drodil/backstage-plugin-qeta/commit/6b687a5a018c6c3eb63358b4ef821bc8676496c4)), closes [#322](https://github.com/drodil/backstage-plugin-qeta/issues/322)

### [3.32.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.32.0...v3.32.1) (2025-07-31)


### Bug Fixes

* filter post count correctly for collections ([7dfcfd4](https://github.com/drodil/backstage-plugin-qeta/commit/7dfcfd40a4ef80532486de102b54a3622cbb25a3))

## [3.32.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.31.4...v3.32.0) (2025-07-31)


### Features

* add support for group mentions ([9729d50](https://github.com/drodil/backstage-plugin-qeta/commit/9729d50936c0c188a10babbe3a8f1b0467f618ef))
* allow for configuring mention types ([20fd29c](https://github.com/drodil/backstage-plugin-qeta/commit/20fd29c67f8681cb3a796f548ff5705e39f24cde))
* clean up imports and streamline mention suggestion logic ([f2f9e00](https://github.com/drodil/backstage-plugin-qeta/commit/f2f9e003a5e1e0b8aeaa6cfeb9de28fc12839de4))
* optimize api calls ([bf483eb](https://github.com/drodil/backstage-plugin-qeta/commit/bf483ebf6bb8f1fdd02a3b53ac6e611d0f400472))
* remove unnecessary complex logic for notification sending ([430e29f](https://github.com/drodil/backstage-plugin-qeta/commit/430e29f640d0fb278a9a8d12e856c9db3d2eec96))
* run prettier ([e335dd6](https://github.com/drodil/backstage-plugin-qeta/commit/e335dd6f4ad136d1a1297a7fcf666bd6dcf386be))
* send notifications on post edit ([05d64e5](https://github.com/drodil/backstage-plugin-qeta/commit/05d64e5e5795a82c407b26752a21180366f532c2)), closes [#313](https://github.com/drodil/backstage-plugin-qeta/issues/313)


### Bug Fixes

* empty collections not visible in the ui ([6bb9564](https://github.com/drodil/backstage-plugin-qeta/commit/6bb956487cccd93eae704532646a2d5ac6a610e7)), closes [#317](https://github.com/drodil/backstage-plugin-qeta/issues/317)
* failing linting/prettier checks ([c7857ab](https://github.com/drodil/backstage-plugin-qeta/commit/c7857ab837b6c30dfa26a36f146f348342040aab))
* mention config visiblity ([235efcf](https://github.com/drodil/backstage-plugin-qeta/commit/235efcfa8f2b68d81dca704806056b3127440d68))
* tsc errors due to backstage update ([5cddf35](https://github.com/drodil/backstage-plugin-qeta/commit/5cddf35909787855146879f4c3b98abc84edc3ac))

### [3.31.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.31.3...v3.31.4) (2025-06-19)


### Bug Fixes

* refactor authorboxes to single component ([520139a](https://github.com/drodil/backstage-plugin-qeta/commit/520139ad007d90d7ace0181bff2026aa20aef7b7))

### [3.31.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.31.2...v3.31.3) (2025-06-19)


### Bug Fixes

* do not log binary image in attachments ([fd8e4c7](https://github.com/drodil/backstage-plugin-qeta/commit/fd8e4c7f3b315bc05a7e2a5e250873841d36ca64))

### [3.31.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.31.1...v3.31.2) (2025-06-18)


### Bug Fixes

* add missing tests for router ([f336140](https://github.com/drodil/backstage-plugin-qeta/commit/f336140bf37d2d65124a731dd9064bf8ad99a686))
* git add forgot ([cbab67c](https://github.com/drodil/backstage-plugin-qeta/commit/cbab67c46d836a85d1377f4c334257d05757395e))
* navigation after deleting items ([985df3b](https://github.com/drodil/backstage-plugin-qeta/commit/985df3bf9f676aeded95687d5559bc509185d38b))
* show alert when draft is saved ([d9eaf86](https://github.com/drodil/backstage-plugin-qeta/commit/d9eaf860baf3ee93c6097f60b7eea1550cd6544e))

### [3.31.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.31.0...v3.31.1) (2025-06-18)


### Bug Fixes

* allow using relative urls for uploaded images ([3e5a119](https://github.com/drodil/backstage-plugin-qeta/commit/3e5a119c0eade578f23932635362699358b8684b)), closes [#310](https://github.com/drodil/backstage-plugin-qeta/issues/310)
* small improvement on comment add button ([ceefe9d](https://github.com/drodil/backstage-plugin-qeta/commit/ceefe9d5dd19663ad8ee0e01d77d3821ef38161e))

## [3.31.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.30.2...v3.31.0) (2025-06-18)


### Features

* add auto save feature to post form ([46d4f85](https://github.com/drodil/backstage-plugin-qeta/commit/46d4f85d7c852a9de46eceee1ee4b3d1814e45c3))
* add suggestion to finish draft posts ([ad3e7a7](https://github.com/drodil/backstage-plugin-qeta/commit/ad3e7a783aa5338c07da082866afc40415ba9a63))
* allow filtering drafts from filter panel ([c5d6bf2](https://github.com/drodil/backstage-plugin-qeta/commit/c5d6bf2a17a3e1d5d6834e5870a8ecb450a9143b))
* allow only moderators to delete answers and comments permanently ([321e7a0](https://github.com/drodil/backstage-plugin-qeta/commit/321e7a0339da520b9e3d89423d4a574db953d52a)), closes [#87](https://github.com/drodil/backstage-plugin-qeta/issues/87)
* allow only moderators to delete posts permanently ([8feec29](https://github.com/drodil/backstage-plugin-qeta/commit/8feec294b46ffd12c8c98ac6b89c9abc683ae40d)), closes [#87](https://github.com/drodil/backstage-plugin-qeta/issues/87)
* allow posting drafts ([a2fa363](https://github.com/drodil/backstage-plugin-qeta/commit/a2fa36345b85a74285bdc13bbfef4e4dbc63ba7f)), closes [#204](https://github.com/drodil/backstage-plugin-qeta/issues/204)
* allow restoring deleted posts ([2bf7a60](https://github.com/drodil/backstage-plugin-qeta/commit/2bf7a6058f4b6f1f050b35c3a7f4643552122e65))
* show deleted posts in the moderator page ([c446193](https://github.com/drodil/backstage-plugin-qeta/commit/c44619344ae8f104f9fa2ee5624ce8ce13d2fc85))


### Bug Fixes

* add status to url parameters of filters ([8f62128](https://github.com/drodil/backstage-plugin-qeta/commit/8f62128a15cea2e7bf2107ed18827c0a137499f6))
* allow undefined in filter panel changes ([ce431b7](https://github.com/drodil/backstage-plugin-qeta/commit/ce431b755014aea6ed734194e450b25ec8b34c00))
* answer card updated expert tag ([170eccd](https://github.com/drodil/backstage-plugin-qeta/commit/170eccd8d6a87574b11400639662e7d5360f8f8c))
* router tests ([bd53a8b](https://github.com/drodil/backstage-plugin-qeta/commit/bd53a8b6b00210ca46f1d88fcec6044cb3fc0777))
* router to use permission filtering ([8d811b4](https://github.com/drodil/backstage-plugin-qeta/commit/8d811b43c1496707674f11c2e451a2d6b4a2a825))

### [3.30.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.30.1...v3.30.2) (2025-06-17)


### Bug Fixes

* add missing name properties to inputs ([2e63c70](https://github.com/drodil/backstage-plugin-qeta/commit/2e63c705289f81bea9a3d17e708c7edb9e8c2d9e))
* grid item style improvements ([6d9f505](https://github.com/drodil/backstage-plugin-qeta/commit/6d9f5054496dce0f09c71f1704bb7633900aee27))
* tag input tsc error ([bb7e000](https://github.com/drodil/backstage-plugin-qeta/commit/bb7e000b967532d2c4041e4ebc83894e13e59ed3))

### [3.30.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.30.0...v3.30.1) (2025-06-17)


### Bug Fixes

* improve database tag suggestions ([ffa9655](https://github.com/drodil/backstage-plugin-qeta/commit/ffa965501dd4a60a79dd03c150dda7ce8c5807bb))
* restore search and unify no results views ([9c2158a](https://github.com/drodil/backstage-plugin-qeta/commit/9c2158aef686d6041c679f846bd4e4e61a9d7309))

## [3.30.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.29.2...v3.30.0) (2025-06-16)


### Features

* allow specifying minimum tags and entities ([75ab569](https://github.com/drodil/backstage-plugin-qeta/commit/75ab569f61ea377f6eb67e084865b5f5ea6e63f7)), closes [#308](https://github.com/drodil/backstage-plugin-qeta/issues/308)
* suggest tags based on the post content ([2c3df79](https://github.com/drodil/backstage-plugin-qeta/commit/2c3df795ae9352cda4022f42b662472f50767984)), closes [#307](https://github.com/drodil/backstage-plugin-qeta/issues/307)


### Bug Fixes

* make filterTags also remove invalid characters ([a896e9f](https://github.com/drodil/backstage-plugin-qeta/commit/a896e9f9a922ea36b624a827a4f5fafbae3fb84c)), closes [#283](https://github.com/drodil/backstage-plugin-qeta/issues/283)
* tsc errors ([18eed8f](https://github.com/drodil/backstage-plugin-qeta/commit/18eed8fd31015c26bdf0fc38371fba760f3ce21f))

### [3.29.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.29.1...v3.29.2) (2025-06-16)


### Bug Fixes

* force comment post button to min-width 100% ([96dadfe](https://github.com/drodil/backstage-plugin-qeta/commit/96dadfeba5d9dd5bd1722b062e29e144db8a6687))
* post editing ([5cf2764](https://github.com/drodil/backstage-plugin-qeta/commit/5cf276472efce5f51685ff0db0ceac88ba133218))

### [3.29.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.29.0...v3.29.1) (2025-06-16)


### Bug Fixes

* also fix the font size in post grid item ([ba885b4](https://github.com/drodil/backstage-plugin-qeta/commit/ba885b478a45147a6e949b2b42afe95b6d445eea))
* list item content to take enough space ([b3d7b74](https://github.com/drodil/backstage-plugin-qeta/commit/b3d7b744ecb3a22395e1322f39cdfafa57eecce3))
* remove custom font sizes ([b9bcd00](https://github.com/drodil/backstage-plugin-qeta/commit/b9bcd00a19f1ed870431c1d37197fa4e6d20c236))

## [3.29.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.28.2...v3.29.0) (2025-06-16)


### Features

* add copy code to clipboard in markdown renderer ([1ffdd2c](https://github.com/drodil/backstage-plugin-qeta/commit/1ffdd2cd09a8209ad9d18a160faff1f0f7fe8342))
* add icon to markdown help link ([f3d4f28](https://github.com/drodil/backstage-plugin-qeta/commit/f3d4f282f84736380ec81e642f23e29ade5afb75))
* add more info to post form ([a2b51a0](https://github.com/drodil/backstage-plugin-qeta/commit/a2b51a095b02308d2b6ee0c125dd71145f25e696))
* add more readable markdown content ([d48402c](https://github.com/drodil/backstage-plugin-qeta/commit/d48402c06896c0339e84c60955cd4e4f65d68157))
* add support for generate content for code blocks ([db2edec](https://github.com/drodil/backstage-plugin-qeta/commit/db2edeceff31ac62ffa73da291c845690b123297))
* allow hiding comments in comment section ([56174ec](https://github.com/drodil/backstage-plugin-qeta/commit/56174eca9686d1a27c3d5edcc380a1fb2d0297d7))
* allow switching between list and grid views ([ff1f7a2](https://github.com/drodil/backstage-plugin-qeta/commit/ff1f7a2740377956e8c502650dbbdc3227389eba))
* header image upload ui improvements ([25121c5](https://github.com/drodil/backstage-plugin-qeta/commit/25121c51d91adcb13c6b819132526ec3aedf6d64))
* improve authorbox rendering in questions ([ba3957b](https://github.com/drodil/backstage-plugin-qeta/commit/ba3957bb17a333e08663b8fb37804244c6072d2f))
* improve comment section rendering ([b598bb0](https://github.com/drodil/backstage-plugin-qeta/commit/b598bb04c61bdd7a116df6024bb7a86b8cf3f8eb))
* improve favorite page to show the post type ([947b3df](https://github.com/drodil/backstage-plugin-qeta/commit/947b3df339d2712e4f7708d4853be9df43f5de64))
* improve grid layout ([323e78d](https://github.com/drodil/backstage-plugin-qeta/commit/323e78d8c70a0d09452909190ee4f8ef145aa428))
* improve grid list item footer styling ([0123180](https://github.com/drodil/backstage-plugin-qeta/commit/01231802d4b475792d34b1c0bf0422f9b1714b8d))
* improve impact card usability ([8c5b32a](https://github.com/drodil/backstage-plugin-qeta/commit/8c5b32af2c1ea5cb216f7bd2f8444089baeafd7d))
* improve pagination page size selection ([5c6016a](https://github.com/drodil/backstage-plugin-qeta/commit/5c6016af353ec92d6a43b7e5e2b4f64b1cbb102f))
* improve posts grid and list item usability ([79fbabe](https://github.com/drodil/backstage-plugin-qeta/commit/79fbabe90b0e4901fbe93b447205bfc3ad5f0ac0))
* improve right list rendering ([4113ad0](https://github.com/drodil/backstage-plugin-qeta/commit/4113ad0c95e4f8a624a3e7cd79c283a1e7c6d560))
* improve search functionality and add more indexes ([e39b368](https://github.com/drodil/backstage-plugin-qeta/commit/e39b368cdca2be39e55c0c83910807f192722845))
* improve suggestions card layaout ([dabe106](https://github.com/drodil/backstage-plugin-qeta/commit/dabe1067461639932326e3a06b92cfe30ec1f506))
* improve texts in date filter ([a523169](https://github.com/drodil/backstage-plugin-qeta/commit/a52316912b5eb8295cb8d3050053e43d98493174))
* improve the grid styling ([54f3f2f](https://github.com/drodil/backstage-plugin-qeta/commit/54f3f2fe1b11394563f456355e03e44988b2bd29))
* improve tooltip styling ([55480e2](https://github.com/drodil/backstage-plugin-qeta/commit/55480e2bae40e0052f5222032936becad2f56f20))
* improve trend calculation weights and add time decay ([8419143](https://github.com/drodil/backstage-plugin-qeta/commit/841914335f462bf12b8dae3b0be21d739110fbf7))
* make the left menu a bit more beautiful ([3db9123](https://github.com/drodil/backstage-plugin-qeta/commit/3db9123b6657d478cde84c4e7f0e1bb24b9a246c))
* more improvements on post list item and author box ([d39d50c](https://github.com/drodil/backstage-plugin-qeta/commit/d39d50c8e5d1145805d7adc277820b6533a0da39))
* more post list item improvements ([65a9c55](https://github.com/drodil/backstage-plugin-qeta/commit/65a9c55da76b12192a9fba129f348e2225fede29))
* new ui for the right list items ([70b2387](https://github.com/drodil/backstage-plugin-qeta/commit/70b2387ebb0472ad4b3168cd3e039c2e0596fdef))
* overall accessibility improvements ([054b097](https://github.com/drodil/backstage-plugin-qeta/commit/054b097b0d26ebc752c517cdee2c37530a74317b))
* remember filter panel settings ([16b0cc1](https://github.com/drodil/backstage-plugin-qeta/commit/16b0cc1931b6fd41a64027ac45bcb3544bb6b50c)), closes [#301](https://github.com/drodil/backstage-plugin-qeta/issues/301)
* render long numbers in highlight list ([18561ce](https://github.com/drodil/backstage-plugin-qeta/commit/18561ce1172be1f7f2bdeed6edcda6b51076a331))
* search bar ui improvements ([f7248b6](https://github.com/drodil/backstage-plugin-qeta/commit/f7248b604c4af16c8b45ba94c39c7e29d2ff85b8))
* stats chart ui improvements ([112b15d](https://github.com/drodil/backstage-plugin-qeta/commit/112b15d68358df4e2dacc48e885c32e55bb1ae05))
* stats improvements ([d2001ca](https://github.com/drodil/backstage-plugin-qeta/commit/d2001ca255507cbb76fd03083cbe457ed74d3c07))
* unify the grid look-and-feel ([0bef7c7](https://github.com/drodil/backstage-plugin-qeta/commit/0bef7c7b8f7387ed2aa3f0ccea9be513ad550efc))
* unify the titles of different pages ([e672d3a](https://github.com/drodil/backstage-plugin-qeta/commit/e672d3a7b79624515a05a91a84c95ef13d7bcab9))


### Bug Fixes

* add fallback for window.navigation if unsupported ([3b05f8c](https://github.com/drodil/backstage-plugin-qeta/commit/3b05f8c7e51207b81f0bc5242d492005ec9f90c4))
* couple of tooltip fixes for grid items ([b0bd847](https://github.com/drodil/backstage-plugin-qeta/commit/b0bd8475fdc2b6c9a1a1be12101197b878286504))

### [3.28.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.28.1...v3.28.2) (2025-05-23)


### Bug Fixes

* **backend:** parameter order of onMention calls ([84360bd](https://github.com/drodil/backstage-plugin-qeta/commit/84360bd6d60f666fc7887d19babb3e19ae7e29e9))
* small tuning for post list item ui ([c043963](https://github.com/drodil/backstage-plugin-qeta/commit/c043963973ae70543d39852438a2b92fb7dbe8f5))

### [3.28.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.28.0...v3.28.1) (2025-05-22)


### Bug Fixes

* also check for undefined window.navigation ([550722d](https://github.com/drodil/backstage-plugin-qeta/commit/550722d20d23219ad084acb568fe718681b276c8))
* check for navigation in window to fix firefox ([9d213aa](https://github.com/drodil/backstage-plugin-qeta/commit/9d213aac0da0055fed9c1f6b48b6cf999078dc35))

## [3.28.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.27.0...v3.28.0) (2025-05-22)


### Features

* allow tag experts to edit/delete resources ([56843a7](https://github.com/drodil/backstage-plugin-qeta/commit/56843a7b4b483e31fb124f707dcbd68e83dbe910))


### Bug Fixes

* overall performance improvements ([c7829ee](https://github.com/drodil/backstage-plugin-qeta/commit/c7829eed7b9e88f3e41457a3599fd0abc60cde58))
* tests for tag updater, tag query typing ([8f98f57](https://github.com/drodil/backstage-plugin-qeta/commit/8f98f57b04d28de37ad2b217444453bd44b03c8c))

## [3.27.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.26.0...v3.27.0) (2025-05-21)


### Features

* add circular progress for pickers ([17674ca](https://github.com/drodil/backstage-plugin-qeta/commit/17674ca4367e0715f8c946f27bf8fde9bfff903d))
* add permission rule for tag experts ([5a79ca0](https://github.com/drodil/backstage-plugin-qeta/commit/5a79ca02bfef02e725c64800143f95853abceaa5))
* allow defining tag experts ([a57f6d6](https://github.com/drodil/backstage-plugin-qeta/commit/a57f6d6b25de2fdf350586f099d61223b352d2e7)), closes [#229](https://github.com/drodil/backstage-plugin-qeta/issues/229)


### Bug Fixes

* tsc errors ([cb210fa](https://github.com/drodil/backstage-plugin-qeta/commit/cb210fa22446c68e533463b10183706a343a9069))

## [3.26.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.25.1...v3.26.0) (2025-05-15)


### Features

* add help text for adding tags ([0e0654f](https://github.com/drodil/backstage-plugin-qeta/commit/0e0654f1030fcccb9c5c0770d77fd5cc083fcabf)), closes [#281](https://github.com/drodil/backstage-plugin-qeta/issues/281)
* show loading text for entity and tag inputs ([6aa9f43](https://github.com/drodil/backstage-plugin-qeta/commit/6aa9f4311816eeee975926258d3558235c7e7a7e)), closes [#298](https://github.com/drodil/backstage-plugin-qeta/issues/298)

### [3.25.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.25.0...v3.25.1) (2025-05-13)


### Bug Fixes

* use users count in stats collector ([f53b508](https://github.com/drodil/backstage-plugin-qeta/commit/f53b5086af7ba09a5076938530b41c44872c3917))

## [3.25.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.24.5...v3.25.0) (2025-05-13)


### Features

* allow setting moderator access using permissions ([623b762](https://github.com/drodil/backstage-plugin-qeta/commit/623b762f2d3824f6182ffc26e63f16ff41d251b7))


### Bug Fixes

* add attachment mapper to support different knex dialects ([c77fec6](https://github.com/drodil/backstage-plugin-qeta/commit/c77fec60229a01f838a3b5cec21f58bf841be41b))
* add loading to stats + improve performance ([ab3a5d4](https://github.com/drodil/backstage-plugin-qeta/commit/ab3a5d4161152a71b22595ace61d2c8c6c58eabf)), closes [#287](https://github.com/drodil/backstage-plugin-qeta/issues/287)
* authorize mocks in tests ([7b2a98d](https://github.com/drodil/backstage-plugin-qeta/commit/7b2a98dfbaa36b112507243b114e859776271534))
* fetch owned entities only once for filter panel ([9e147a4](https://github.com/drodil/backstage-plugin-qeta/commit/9e147a4aea9e2ff045ceb6727528348cfd65e4f4))
* show active menu for subpaths ([6ba4e49](https://github.com/drodil/backstage-plugin-qeta/commit/6ba4e49a92ecb61ae87ab1bc2a11506cfd39a08e))

### [3.24.5](https://github.com/drodil/backstage-plugin-qeta/compare/v3.24.4...v3.24.5) (2025-04-11)

### [3.24.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.24.3...v3.24.4) (2025-04-11)


### Bug Fixes

* allow modifier key clicks in left menu ([9855f04](https://github.com/drodil/backstage-plugin-qeta/commit/9855f04570ed18d528144591ecad872d1fec2f7f)), closes [#290](https://github.com/drodil/backstage-plugin-qeta/issues/290)
* better dirty check for forms ([23b72aa](https://github.com/drodil/backstage-plugin-qeta/commit/23b72aa44ffc6d1094d6de272f831992554837ca)), closes [#289](https://github.com/drodil/backstage-plugin-qeta/issues/289)
* improve entity picker look&feel ([36f7db1](https://github.com/drodil/backstage-plugin-qeta/commit/36f7db1abc3fed801f64822283f6e3190bf940f6)), closes [#288](https://github.com/drodil/backstage-plugin-qeta/issues/288)
* tag resource fetching that prevents tag deletion ([51a6b70](https://github.com/drodil/backstage-plugin-qeta/commit/51a6b70c02ea087750151d776d0bc065a06c02fc)), closes [#291](https://github.com/drodil/backstage-plugin-qeta/issues/291)
* tags updater update tag call to use id ([f889982](https://github.com/drodil/backstage-plugin-qeta/commit/f8899820ced836da021efd09f62c1526e84ea312))

### [3.24.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.24.2...v3.24.3) (2025-03-27)


### Bug Fixes

* improve search performance ([d78029a](https://github.com/drodil/backstage-plugin-qeta/commit/d78029a9a274a2af35fcffc61cf4d5031546c51b)), closes [#284](https://github.com/drodil/backstage-plugin-qeta/issues/284)

### [3.24.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.24.1...v3.24.2) (2025-03-19)


### Bug Fixes

* add to collection button not showing ([ae2ab41](https://github.com/drodil/backstage-plugin-qeta/commit/ae2ab419005c206d57ccc1071518e63005eab366)), closes [#282](https://github.com/drodil/backstage-plugin-qeta/issues/282)

### [3.24.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.24.0...v3.24.1) (2025-03-19)

## [3.24.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.23.0...v3.24.0) (2025-03-11)


### Features

* add default permission policy to node plugin ([6e04413](https://github.com/drodil/backstage-plugin-qeta/commit/6e04413ec056720ce4894cc6e6c9ea80f4656c19))
* allow editing comments ([949ffb7](https://github.com/drodil/backstage-plugin-qeta/commit/949ffb76e38659aadcc9a8b748d6d7487de623aa))
* improve auditor logging to include details ([3efef89](https://github.com/drodil/backstage-plugin-qeta/commit/3efef898afa507d2b4795ca7b385c51fa8c4816e))


### Bug Fixes

* make sure comments are ordered by created timestamp ([6baf957](https://github.com/drodil/backstage-plugin-qeta/commit/6baf957da94a5d4287841db43c16c92ad3dcc541))
* response codes in tests ([7dfab63](https://github.com/drodil/backstage-plugin-qeta/commit/7dfab63533d86a637c658cdb6276268e4c79aadf))

## [3.23.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.22.0...v3.23.0) (2025-02-25)


### Features

* add support for auditor service ([fdbd240](https://github.com/drodil/backstage-plugin-qeta/commit/fdbd240013e296584743c0b713101d3c6b3ed66e))
* allow disabling notifications from config ([7e0a3c8](https://github.com/drodil/backstage-plugin-qeta/commit/7e0a3c8dd9f4d67ab9f5282d40317701c2a0e3a3))
* do not check edit/delete access in list operations ([a5845a2](https://github.com/drodil/backstage-plugin-qeta/commit/a5845a2a7f0be932ae334270f0ed93c46f8a0b0e))
* notify users who have favorited a post ([38bb945](https://github.com/drodil/backstage-plugin-qeta/commit/38bb94510ec9d7523d7eff9126b2de35c41d2e2e)), closes [#199](https://github.com/drodil/backstage-plugin-qeta/issues/199)


### Bug Fixes

* make from and to date filters work also alone ([49df38e](https://github.com/drodil/backstage-plugin-qeta/commit/49df38e287bc52f1296e292ddc24f188780e4267))
* notification manager initialization ([98b8aee](https://github.com/drodil/backstage-plugin-qeta/commit/98b8aeed4ead8230a26a7cf52156705a515c5b1a))
* router test mocks ([35d631f](https://github.com/drodil/backstage-plugin-qeta/commit/35d631f673c6f55723f9f90ac9d049150fba16cc))

## [3.22.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.21.0...v3.22.0) (2025-02-24)


### Features

* update to backstage 1.36.1 ([de67f87](https://github.com/drodil/backstage-plugin-qeta/commit/de67f8771dce2c04223f78d6d33a8ca29a6ca486))

## [3.21.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.20.3...v3.21.0) (2025-02-20)


### Features

* **search:** add search result item extension ([b107f0a](https://github.com/drodil/backstage-plugin-qeta/commit/b107f0aeebbbdd03842716ef7d17fad21869e1f6))
* support tags and entities in filter search params ([38e4b37](https://github.com/drodil/backstage-plugin-qeta/commit/38e4b37433229356c08cf3e9ba8056b316983f16)), closes [#264](https://github.com/drodil/backstage-plugin-qeta/issues/264)


### Bug Fixes

* do not run conditional authorize if permissions are not enabled ([02c044e](https://github.com/drodil/backstage-plugin-qeta/commit/02c044e51751e5b063613742e89c4739a0289e4a))
* improve handling of forbidden responses ([487ee23](https://github.com/drodil/backstage-plugin-qeta/commit/487ee23daecbb952c78353a81f0065799e1e8b73))

### [3.20.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.20.2...v3.20.3) (2025-02-17)


### Bug Fixes

* make sure to have answers filters in post queries ([2a542d7](https://github.com/drodil/backstage-plugin-qeta/commit/2a542d7ac8ff6f48ac10b5479ac11d4f724ab31a))

### [3.20.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.20.1...v3.20.2) (2025-02-17)


### Bug Fixes

* remove unnecessary console log ([3acef46](https://github.com/drodil/backstage-plugin-qeta/commit/3acef4616a4caf7d0ae4e256f66dee24f0545abe))
* show collection posts count without fetching all posts ([d4a35fa](https://github.com/drodil/backstage-plugin-qeta/commit/d4a35fa887d3a7e5cf954a6f925ab006c6c5db75))

### [3.20.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.20.0...v3.20.1) (2025-02-17)


### Bug Fixes

* tsc issue with permissions ([24fd950](https://github.com/drodil/backstage-plugin-qeta/commit/24fd95071918dbfbb93c692d20884540b7b148dc))

## [3.20.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.19.0...v3.20.0) (2025-02-17)


### Features

* allow showing articles in home page table ([07f616e](https://github.com/drodil/backstage-plugin-qeta/commit/07f616e0783e32e269e20a33b2704de23344ed03)), closes [#269](https://github.com/drodil/backstage-plugin-qeta/issues/269)
* **search:** add q&a search result list item ([7220ec8](https://github.com/drodil/backstage-plugin-qeta/commit/7220ec8f15b79950010b0e20c6c1837cbe4bc572)), closes [#266](https://github.com/drodil/backstage-plugin-qeta/issues/266)

## [3.19.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.18.2...v3.19.0) (2025-02-14)


### Features

* add new resource types and rules for tags and collections ([f804ea2](https://github.com/drodil/backstage-plugin-qeta/commit/f804ea2b2093d039aeacc5da29c0735f14225bd1)), closes [#222](https://github.com/drodil/backstage-plugin-qeta/issues/222) [#236](https://github.com/drodil/backstage-plugin-qeta/issues/236)
* collection permissions in use ([2d6c117](https://github.com/drodil/backstage-plugin-qeta/commit/2d6c11776de194c37c5185af3197207f917d6824))
* tag router support for permissions ([9bd0f8a](https://github.com/drodil/backstage-plugin-qeta/commit/9bd0f8af016fc346901d00678172ddaa999e69ed))


### Bug Fixes

* allow service token in collections query ([f31b4fb](https://github.com/drodil/backstage-plugin-qeta/commit/f31b4fbf3f685050e06df6447d4f2adafed80807))
* icon style ([6c68272](https://github.com/drodil/backstage-plugin-qeta/commit/6c68272ff99620e2c7f11932f54c6e677fa816b3))
* make sure collection responses are filtered ([14e8b48](https://github.com/drodil/backstage-plugin-qeta/commit/14e8b48c07d01cf78a8e4c712a1bc8243d0cde7d))
* migration script of comments ([d84f591](https://github.com/drodil/backstage-plugin-qeta/commit/d84f591aa2ab49697f266f4a5c55b7b21f8fa1e7))
* minor navigation improvements ([229265b](https://github.com/drodil/backstage-plugin-qeta/commit/229265b8c93577bbdf953a5f181bb1f9073b777a))
* minor ui tunings for longer loading times ([33e940b](https://github.com/drodil/backstage-plugin-qeta/commit/33e940b11a827afc1b68c7ad7f3586cee96d417a))
* pass comment filters to answers as well ([d48d063](https://github.com/drodil/backstage-plugin-qeta/commit/d48d06398724f622981035fda755642cc4bf512c))
* test fixes for new parameters ([895b3ec](https://github.com/drodil/backstage-plugin-qeta/commit/895b3ecac8516d0f9a2ebd7f76e27b1967dec5f6))

### [3.18.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.18.1...v3.18.2) (2025-02-12)


### Bug Fixes

* filter resource refs before mapping them to entities ([89f82d8](https://github.com/drodil/backstage-plugin-qeta/commit/89f82d8de903fd08ee891690a1b5410847df3997))
* improve resource ref creation ([ed69737](https://github.com/drodil/backstage-plugin-qeta/commit/ed69737d42c697810580cc833f79b903ac14566c))
* long codeblocks going out of the screen ([40cb5b5](https://github.com/drodil/backstage-plugin-qeta/commit/40cb5b5a0999e902dccf11638dbf40a58da83df8))
* resource ref creation ([f10661a](https://github.com/drodil/backstage-plugin-qeta/commit/f10661ab3452453ddd5123a870905e4d7b5358ad))

### [3.18.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.18.0...v3.18.1) (2025-02-12)


### Bug Fixes

* null return values from permission router ([ff40220](https://github.com/drodil/backstage-plugin-qeta/commit/ff40220e2d82194e02981451512f9cd9a6f7a8d6))

## [3.18.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.17.6...v3.18.0) (2025-02-12)


### Features

* include entities to post search ([e7142fd](https://github.com/drodil/backstage-plugin-qeta/commit/e7142fd29f582b3cc0d65e98800037357e9eff40))
* post search to support also tag searching ([7200273](https://github.com/drodil/backstage-plugin-qeta/commit/7200273fb0c25e4422f6ca5a715bb9fbbe13cb09)), closes [#250](https://github.com/drodil/backstage-plugin-qeta/issues/250)
* show entity type in entity picker to differentiate entities better ([f253187](https://github.com/drodil/backstage-plugin-qeta/commit/f253187bfe699fc24a1219e40b2c5e92abacb337))


### Bug Fixes

* tag search not finding with only tag name ([00e4025](https://github.com/drodil/backstage-plugin-qeta/commit/00e4025afa7af0111bd798638eab46e5ab2f49fe)), closes [#251](https://github.com/drodil/backstage-plugin-qeta/issues/251)
* use left join instead innert join for search queries ([8b5bf62](https://github.com/drodil/backstage-plugin-qeta/commit/8b5bf6201a0e29f7ad11eb0c7b5e826c83380c38))

### [3.17.6](https://github.com/drodil/backstage-plugin-qeta/compare/v3.17.5...v3.17.6) (2025-02-10)


### Bug Fixes

* do not change entity title if not a ref ([#263](https://github.com/drodil/backstage-plugin-qeta/issues/263)) ([0c8944d](https://github.com/drodil/backstage-plugin-qeta/commit/0c8944dc87b78dc357b6edbffb549399c4dc5e08))
* permission mapping with service token ([af99ca1](https://github.com/drodil/backstage-plugin-qeta/commit/af99ca12f0a9aac1a9012b2f110468c9c86d6638))

### [3.17.5](https://github.com/drodil/backstage-plugin-qeta/compare/v3.17.4...v3.17.5) (2025-02-03)


### Bug Fixes

* specific list posts response ([b21fdcc](https://github.com/drodil/backstage-plugin-qeta/commit/b21fdccd9574bc3d59fb1e2f365b714015144d15))

### [3.17.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.17.3...v3.17.4) (2025-02-03)


### Bug Fixes

* correct resource refs + local search testing ([d45f319](https://github.com/drodil/backstage-plugin-qeta/commit/d45f3197b9b4fc3aa8c991b61f08fc210eb73b61))
* pass resource specific permissions to permission router ([4c5786a](https://github.com/drodil/backstage-plugin-qeta/commit/4c5786a5cd2e4f41afb19f5b420e251061a90a3e))
* search collator to work with permissions ([032d104](https://github.com/drodil/backstage-plugin-qeta/commit/032d104c867eed567d57986f42fc3db704990398))

### [3.17.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.17.2...v3.17.3) (2025-01-27)


### Bug Fixes

* add external s3 capabilities to match techdocs implementations ([75f2a10](https://github.com/drodil/backstage-plugin-qeta/commit/75f2a10b1bd61e845372fa31af5d60a78f7c9356))
* collection read access check on collection page ([fe7990c](https://github.com/drodil/backstage-plugin-qeta/commit/fe7990cad6aaefbe0028e8e7002180327afd010d))
* deny attachments with allowed mime type ([708ea46](https://github.com/drodil/backstage-plugin-qeta/commit/708ea46c07bb9e5879edebc2a6ba7355ee4fca20))
* ignore form submit on SearchBar ([f3ac42d](https://github.com/drodil/backstage-plugin-qeta/commit/f3ac42dcab31dd56096302c65285e2369dd3f106)), closes [#262](https://github.com/drodil/backstage-plugin-qeta/issues/262)
* tsc linting ([3347276](https://github.com/drodil/backstage-plugin-qeta/commit/334727692406a57bc762f5d6f52292ee81947b5e))

### [3.17.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.17.1...v3.17.2) (2025-01-17)


### Bug Fixes

* make sure the permissions are also returned with collection queries ([8638d85](https://github.com/drodil/backstage-plugin-qeta/commit/8638d85e933258ca31f6d2309bf0135fb450fd41))

### [3.17.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.17.0...v3.17.1) (2025-01-17)


### Bug Fixes

* comment & answer delete access checks in the UI ([a577d61](https://github.com/drodil/backstage-plugin-qeta/commit/a577d61ee09650101b30660ae4958e9696f68b54))

## [3.17.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.16.4...v3.17.0) (2025-01-10)


### Features

* allow passing user claims to author permission rules ([3546008](https://github.com/drodil/backstage-plugin-qeta/commit/354600830430e779283b004b058334f361178f64)), closes [#256](https://github.com/drodil/backstage-plugin-qeta/issues/256)

### [3.16.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.16.3...v3.16.4) (2025-01-07)


### Bug Fixes

* prettier ([5595a8d](https://github.com/drodil/backstage-plugin-qeta/commit/5595a8d447c96db7f14bdda4837f4625d4724055))
* type the file upload options ([1c3abc2](https://github.com/drodil/backstage-plugin-qeta/commit/1c3abc2a317b37196fc49ba58f834e714d46169e))

### [3.16.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.16.2...v3.16.3) (2024-12-05)


### Bug Fixes

* add missing type condition factory ([82b5c8e](https://github.com/drodil/backstage-plugin-qeta/commit/82b5c8ea059bd481ef9677a2b71eb8ff1827eb2a))
* use correct name for the delete permission ([1a579d3](https://github.com/drodil/backstage-plugin-qeta/commit/1a579d3854711d35e968266dc2aad09f2d94c014))

### [3.16.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.16.1...v3.16.2) (2024-12-04)


### Bug Fixes

* also fix header image input for collection form ([7b0437a](https://github.com/drodil/backstage-plugin-qeta/commit/7b0437adbbe32b2b25e6d65c3898a9984f057a53))

### [3.16.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.16.0...v3.16.1) (2024-12-04)


### Bug Fixes

* header image change not to replace content ([b4c5c6c](https://github.com/drodil/backstage-plugin-qeta/commit/b4c5c6c62a7a5fab480db7e9dcb49fcd5bf71c04))

## [3.16.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.15.3...v3.16.0) (2024-11-29)


### Features

* add toc to article page ([37b327f](https://github.com/drodil/backstage-plugin-qeta/commit/37b327fb64b2d96bb71d231af87d0680f5a2a563))
* allow copying link to markdown headers ([7bbaa0e](https://github.com/drodil/backstage-plugin-qeta/commit/7bbaa0ed86711018c617e0b86b6d0c86c2d15461))
* allow creating tags by adding them to content ([21caf2e](https://github.com/drodil/backstage-plugin-qeta/commit/21caf2ec5c22d5a316633312b6443235af419064))
* collect tags from text in the ui instead backend and add suggestions ([bf8b1ad](https://github.com/drodil/backstage-plugin-qeta/commit/bf8b1ad4acf0bd9c192cb14b19f329d4d4eca66c))
* show links in markdown content as chips ([eb156c7](https://github.com/drodil/backstage-plugin-qeta/commit/eb156c7e9cf15aee176a2e0ed5fb1fbc1e4b2b6e))


### Bug Fixes

* add colors to article buttons ([5f02db3](https://github.com/drodil/backstage-plugin-qeta/commit/5f02db30a4253dbdded9f30d8e0bd5360f44a14f))
* default to empty name in user info ([c5f0bd3](https://github.com/drodil/backstage-plugin-qeta/commit/c5f0bd3617312d53e53bf68633e18604c2a02c6d))
* tags test ([3060da1](https://github.com/drodil/backstage-plugin-qeta/commit/3060da10fc588f878acdce5ee6814607708e3806))
* tests and route utility ([8c889fe](https://github.com/drodil/backstage-plugin-qeta/commit/8c889fe52835f7053904e38fa22e4d80c5d2d381))
* use blank links in preview for users and tags ([c315fe7](https://github.com/drodil/backstage-plugin-qeta/commit/c315fe7b039c12e23e2cca297b5dc9234df3f361))
* use mui typography for markdown headers ([44cec53](https://github.com/drodil/backstage-plugin-qeta/commit/44cec532b3bcdd67b695319bd1146784e0c40276))
* use post type in vote button tooltips ([1a7b304](https://github.com/drodil/backstage-plugin-qeta/commit/1a7b304de50edca1f5fe91a429faf54bc5bb538c))

### [3.15.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.15.2...v3.15.3) (2024-11-28)


### Bug Fixes

* search bar width in entities page ([9b47198](https://github.com/drodil/backstage-plugin-qeta/commit/9b4719873c76fd7c10f8bfe3013f902e7f59b197))
* use correct name for own questions in post list ([5a3e942](https://github.com/drodil/backstage-plugin-qeta/commit/5a3e942c2fbda7d5365454d09b33cb27aa43dba5))
* use less space in right side lists ([3295b85](https://github.com/drodil/backstage-plugin-qeta/commit/3295b85e2ec122e1265d52d00bfdbe7b19ef12e4))
* use search bar also in entities and collections grids ([5dffcb2](https://github.com/drodil/backstage-plugin-qeta/commit/5dffcb2867ed3c3b85e492deebea2638be5464e3))

### [3.15.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.15.1...v3.15.2) (2024-11-28)


### Bug Fixes

* virtualize entity and tag pickers to work with large amount ([6e91073](https://github.com/drodil/backstage-plugin-qeta/commit/6e91073ce77a30d4c9a099193e73cc96e3408768))

### [3.15.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.15.0...v3.15.1) (2024-11-28)


### Bug Fixes

* moderator check in tags page ([adb2948](https://github.com/drodil/backstage-plugin-qeta/commit/adb29484f15f9078d94096818d2e5abfdedceef1))

## [3.15.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.14.0...v3.15.0) (2024-11-27)


### Features

* allow deleting tags by moderator ([9a7ce4d](https://github.com/drodil/backstage-plugin-qeta/commit/9a7ce4d15d309ff460fdd4daa475c558343a38ac))
* allow moderators to create tags ([b576792](https://github.com/drodil/backstage-plugin-qeta/commit/b57679265907b42e7f1100ee11c406696cc6e5b1)), closes [#241](https://github.com/drodil/backstage-plugin-qeta/issues/241)


### Bug Fixes

* entity follow tooltip + add icons ([4ad28c6](https://github.com/drodil/backstage-plugin-qeta/commit/4ad28c65745e824dc3115e23d06126dbe623decd))
* filtering of tags in backend to allow existing tags ([41840da](https://github.com/drodil/backstage-plugin-qeta/commit/41840dada65054ca606a8bd748774604d90f0256))
* small fix for user page title rendering ([b9f17eb](https://github.com/drodil/backstage-plugin-qeta/commit/b9f17eb39f4126c8d607ad0da15cc87c13af8b4e))
* use correct params for no questions button ([4af8704](https://github.com/drodil/backstage-plugin-qeta/commit/4af8704fb4c5756a8107064660760f7dcda519b6))

## [3.14.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.13.2...v3.14.0) (2024-11-26)


### Features

* add user image to user page ([c38ebe7](https://github.com/drodil/backstage-plugin-qeta/commit/c38ebe7ba04090f653724779d51b070ff87694c6)), closes [#216](https://github.com/drodil/backstage-plugin-qeta/issues/216)


### Bug Fixes

* add margin to collection follow button ([1d03797](https://github.com/drodil/backstage-plugin-qeta/commit/1d03797d16a7edb076a23c4ea7bab5a3fd5698e2))
* interactive for user link + user page lists ([6e279fe](https://github.com/drodil/backstage-plugin-qeta/commit/6e279fe75224964630da2a7aa221e7a9606c8ae8))
* tooltips to be interactive ([23da6a5](https://github.com/drodil/backstage-plugin-qeta/commit/23da6a59cf3c15995ab9879eba1126644c809f04))

### [3.13.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.13.1...v3.13.2) (2024-11-26)


### Bug Fixes

* more UI fixes after MUI4 rollback ([94e34a7](https://github.com/drodil/backstage-plugin-qeta/commit/94e34a782ec3682c4412da5530482dde0ca903e9))
* react warnings all over ([f71c72e](https://github.com/drodil/backstage-plugin-qeta/commit/f71c72ef3798864799b8e35e35f6d0342dade910))

### [3.13.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.13.0...v3.13.1) (2024-11-25)


### Bug Fixes

* small UI fixes for MUI4 ([555e7b3](https://github.com/drodil/backstage-plugin-qeta/commit/555e7b3d87ba27db24a1dd44219f094c16dc6356))

## [3.13.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.12.5...v3.13.0) (2024-11-25)


### Features

* add support for node22 in tests ([949dc9a](https://github.com/drodil/backstage-plugin-qeta/commit/949dc9a8095233b11bf09c4fbba08b1cc3a0ddbb))
* revert back to MUI4 ([31cf62f](https://github.com/drodil/backstage-plugin-qeta/commit/31cf62f8e7ac103dde0b4b83b0aa6b79718345e8)), closes [#244](https://github.com/drodil/backstage-plugin-qeta/issues/244)

### [3.12.5](https://github.com/drodil/backstage-plugin-qeta/compare/v3.12.4...v3.12.5) (2024-11-25)


### Bug Fixes

* small ui improvements ([6b86ded](https://github.com/drodil/backstage-plugin-qeta/commit/6b86ded4d96776ccde6e9bb2dd35b2dc63029365))
* use theme type for markdown styles ([47352e9](https://github.com/drodil/backstage-plugin-qeta/commit/47352e9a616aa104216ffc91f03a1e40f92a92d0))

### [3.12.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.12.3...v3.12.4) (2024-11-25)


### Bug Fixes

* add names for styled components ([46d0a27](https://github.com/drodil/backstage-plugin-qeta/commit/46d0a278967f8c89e53b3363463fcf295075d851))

### [3.12.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.12.2...v3.12.3) (2024-11-22)


### Bug Fixes

* make date object correct in statistics endpoint ([7545f54](https://github.com/drodil/backstage-plugin-qeta/commit/7545f54d3fd9c3e75aaa2b26d40bf3278005abd1))

### [3.12.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.12.1...v3.12.2) (2024-11-22)


### Bug Fixes

* use styled for left menu items ([4588788](https://github.com/drodil/backstage-plugin-qeta/commit/458878880fc7989b3043d0805dc72aa1d9ef7b7c))

### [3.12.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.12.0...v3.12.1) (2024-11-22)


### Bug Fixes

* make sure menu items are 100% width ([e97c3bf](https://github.com/drodil/backstage-plugin-qeta/commit/e97c3bfb514752fe5d6ff34a50c551718c03ea87))
* make sure stats summary is available ([7f500a4](https://github.com/drodil/backstage-plugin-qeta/commit/7f500a4b2505c1c1fe4e9913ffe95bb402104b7f))
* show no stats message if summary is missing ([0556cc1](https://github.com/drodil/backstage-plugin-qeta/commit/0556cc1386c05a9f9139326b00ff635dc93b5e48))
* use correct title for search documents for articles ([eb0e56c](https://github.com/drodil/backstage-plugin-qeta/commit/eb0e56ca4bcacc582459f6e56c85c35a702f76d4))

## [3.12.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.11.0...v3.12.0) (2024-11-20)


### Features

* add suggestions to home page ([85ebc39](https://github.com/drodil/backstage-plugin-qeta/commit/85ebc3917b968362e41ced334d88957bd6b9ea31)), closes [#196](https://github.com/drodil/backstage-plugin-qeta/issues/196)


### Bug Fixes

* impact card margin ([f0567db](https://github.com/drodil/backstage-plugin-qeta/commit/f0567db463d4e4cac16ae5fa93bafecbbb8cff05))
* no correct answer suggestion ([f85fe14](https://github.com/drodil/backstage-plugin-qeta/commit/f85fe1408d5e879cd9ea9b5ba40297bb54830d2a))

## [3.11.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.10.5...v3.11.0) (2024-11-20)


### Features

* add user tooltip for user links ([2f5a412](https://github.com/drodil/backstage-plugin-qeta/commit/2f5a4129d35dcae3caf5e5746d9ea6103e5cbac3))


### Bug Fixes

* followed entity list styling ([d01a90c](https://github.com/drodil/backstage-plugin-qeta/commit/d01a90c747b2a354e7fd6f8d6ed06e493f4de1e9))

### [3.10.5](https://github.com/drodil/backstage-plugin-qeta/compare/v3.10.4...v3.10.5) (2024-11-20)


### Bug Fixes

* remove emotion dependencies once again ([4744122](https://github.com/drodil/backstage-plugin-qeta/commit/47441220923f6b9401562ab9a4cf49c0ffaf5c7f))
* restore error prop for markdown editor ([e630318](https://github.com/drodil/backstage-plugin-qeta/commit/e6303181bb8d06b5e6a83389c7c1ea9a0119d9c5))

### [3.10.4](https://github.com/drodil/backstage-plugin-qeta/compare/v3.10.3...v3.10.4) (2024-11-19)


### Bug Fixes

* add missing emotion dependencies ([16b5514](https://github.com/drodil/backstage-plugin-qeta/commit/16b5514705192fa977f0517e4a80830dac3b9092))

### [3.10.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.10.2...v3.10.3) (2024-11-19)


### Bug Fixes

* remove emotion/css dependency ([2e59cf7](https://github.com/drodil/backstage-plugin-qeta/commit/2e59cf7dd129349eaa53781583c30ca79e582371))

### [3.10.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.10.1...v3.10.2) (2024-11-19)


### Bug Fixes

* remove deprecated form styles ([0591b81](https://github.com/drodil/backstage-plugin-qeta/commit/0591b813e092caaa34d4f5aa60b9387ecc93b512))

### [3.10.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.10.0...v3.10.1) (2024-11-19)


### Bug Fixes

* remove deprecated mui useStyles ([1d14bc9](https://github.com/drodil/backstage-plugin-qeta/commit/1d14bc99ff1fab47dd378b0a0d3966417c2c70ff))

## [3.10.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.9.3...v3.10.0) (2024-11-18)


### Features

* add new post type permission rule ([91c63e1](https://github.com/drodil/backstage-plugin-qeta/commit/91c63e1f9556a9db63833ffda7df4ef33b2279d1))
* add secondary title and icon to entity tooltip ([e32a081](https://github.com/drodil/backstage-plugin-qeta/commit/e32a0817a8930e940f8af11196dda54605027ad7))
* allow determining ai capabilities per user ([2204153](https://github.com/drodil/backstage-plugin-qeta/commit/22041536648ce9dbd6784ccf7f200a4060a6d48c)), closes [#239](https://github.com/drodil/backstage-plugin-qeta/issues/239)
* allow extending tag database with org specific tags ([4faa46d](https://github.com/drodil/backstage-plugin-qeta/commit/4faa46dc79acd48e26614e925244e8d8ed95d5ac))
* refactor r search bar and fix searching ([32e7b1c](https://github.com/drodil/backstage-plugin-qeta/commit/32e7b1c44e2b9d6e9afc02ce155a3f8f856de299))


### Bug Fixes

* answer sorting with mui5 ([c71fc48](https://github.com/drodil/backstage-plugin-qeta/commit/c71fc48c8539403fad46e838bc7dbf0b2feb0f54))
* date range filter with mui5 ([ddc3528](https://github.com/drodil/backstage-plugin-qeta/commit/ddc3528b0c2d182231d3428037b9b2e498d9a135))
* default ai enabled flags to false ([e7603f0](https://github.com/drodil/backstage-plugin-qeta/commit/e7603f067efc54972006e69439212d17837b0ebb))
* more ui tuning for mui5 ([3effba0](https://github.com/drodil/backstage-plugin-qeta/commit/3effba0014ee24f28ec4937f2bdbe08206debed6))
* relative time tooltip with mui5 ([12e5dfd](https://github.com/drodil/backstage-plugin-qeta/commit/12e5dfdc0906783fce2d5367902f4a8fa80d9ed0))
* small ui tuning for mui5 ([f95ca34](https://github.com/drodil/backstage-plugin-qeta/commit/f95ca347766ad1f467da0e01a479360da00f7a5f))
* ui fixes due to mui5 update ([e9325bb](https://github.com/drodil/backstage-plugin-qeta/commit/e9325bb1c9cbf505ee62d3d98db9a3d6ebbba361))

### [3.9.3](https://github.com/drodil/backstage-plugin-qeta/compare/v3.9.2...v3.9.3) (2024-11-05)


### Bug Fixes

* tag input not showing without pre-existing tags ([fda3fd4](https://github.com/drodil/backstage-plugin-qeta/commit/fda3fd4f88b760475388121806ab509c1aa05745)), closes [#235](https://github.com/drodil/backstage-plugin-qeta/issues/235)

### [3.9.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.9.1...v3.9.2) (2024-11-04)


### Bug Fixes

* tests for new endpoints ([9466902](https://github.com/drodil/backstage-plugin-qeta/commit/9466902917d422496c5d0954bf66547e74dc01e3))
* use post query instead get with query parameters not to exceed max url length ([5010ced](https://github.com/drodil/backstage-plugin-qeta/commit/5010ced74b262e5590aa22fa382ecc24f783a8ac))

### [3.9.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.9.0...v3.9.1) (2024-11-01)


### Bug Fixes

* remove favorite filter from hot articles list ([e984c30](https://github.com/drodil/backstage-plugin-qeta/commit/e984c301c9be409940adc51bc92d43c1a7dd5325))

## [3.9.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.8.0...v3.9.0) (2024-11-01)


### Features

* add collection filters ([0ef70d1](https://github.com/drodil/backstage-plugin-qeta/commit/0ef70d19d1e6ce71d6c9626ff10a26584ee36f62))
* add filter for owned entities ([3e7f4b0](https://github.com/drodil/backstage-plugin-qeta/commit/3e7f4b0c340db89cf4a13ef21687790bdfd59144)), closes [#202](https://github.com/drodil/backstage-plugin-qeta/issues/202)
* add starred entities filter ([75dd8bb](https://github.com/drodil/backstage-plugin-qeta/commit/75dd8bb27cd07a6e149f51d5761eccce0c9a38f7)), closes [#202](https://github.com/drodil/backstage-plugin-qeta/issues/202)
* allow filtering by multiple entities ([3342c67](https://github.com/drodil/backstage-plugin-qeta/commit/3342c670c0638225542ef4dcf0e50ee6b6be69ef))


### Bug Fixes

* minor fixes here and there ([1dc5fc8](https://github.com/drodil/backstage-plugin-qeta/commit/1dc5fc8737af1b815a0c2392c7fa48d0448cca8b))

## [3.8.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.7.2...v3.8.0) (2024-10-31)


### Features

* add cache-control for attachments ([af2e24f](https://github.com/drodil/backstage-plugin-qeta/commit/af2e24f2fce27fd15609e84b0e10112ab0d82888)), closes [#231](https://github.com/drodil/backstage-plugin-qeta/issues/231)
* add proper loading icon for containers ([9236fb1](https://github.com/drodil/backstage-plugin-qeta/commit/9236fb12561946e5ab50bf84c2ee949e10f467c7))
* allow ordering by title and trend ([fde94d5](https://github.com/drodil/backstage-plugin-qeta/commit/fde94d5c9f78059cee5b4f20335a0ec1a2b5f83d))
* allow ranking posts inside collection ([e81f728](https://github.com/drodil/backstage-plugin-qeta/commit/e81f728be6b2c43bf28c2f9e31ab4f71e7f03e5a))
* show also tag descriptions as tooltip in inputs ([de0fae5](https://github.com/drodil/backstage-plugin-qeta/commit/de0fae5afeb1bcd058f2fa0dfe5042a5f5d3abcf))


### Bug Fixes

* add type to filters so changing filters doesn't override it ([f2cd96e](https://github.com/drodil/backstage-plugin-qeta/commit/f2cd96e1269ae9e427328f3c9f937dad253f3271))
* fix flex wrap in question card ([9d98989](https://github.com/drodil/backstage-plugin-qeta/commit/9d98989d4066987f296a5a919891e835be52058e))
* question content styling ([4fae219](https://github.com/drodil/backstage-plugin-qeta/commit/4fae219a8021ac8bfa77056d6635071370e95942))
* sqlite tests with rank column ([09f5c5a](https://github.com/drodil/backstage-plugin-qeta/commit/09f5c5a2cda5dc219d250c08eaa4b4406f99dd68))

### [3.7.2](https://github.com/drodil/backstage-plugin-qeta/compare/v3.7.1...v3.7.2) (2024-10-31)


### Bug Fixes

* do not show regenerate button if ai is not enabled ([7c56082](https://github.com/drodil/backstage-plugin-qeta/commit/7c56082752fdddda493dbc82861cd1d671e7d464))
* show loading for ai answer time ([e7c6f17](https://github.com/drodil/backstage-plugin-qeta/commit/e7c6f17d5b29493b333d08a718f69fbb1458dbb4))

### [3.7.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.7.0...v3.7.1) (2024-10-30)


### Bug Fixes

* ai answer regeneration to show loading skeleton ([6301f5e](https://github.com/drodil/backstage-plugin-qeta/commit/6301f5e04e82b8f0897456bf440f6dd81e444626))

## [3.7.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.6.1...v3.7.0) (2024-10-30)


### Features

* improve comment writing with autofocus and bigger textarea ([e64067a](https://github.com/drodil/backstage-plugin-qeta/commit/e64067a5528e519102537567fd44f0f285cabfc5))
* more AI features ([8a97ec4](https://github.com/drodil/backstage-plugin-qeta/commit/8a97ec4388361b25988b5d085f084de8bf26fd98)), closes [#225](https://github.com/drodil/backstage-plugin-qeta/issues/225) [#226](https://github.com/drodil/backstage-plugin-qeta/issues/226) [#227](https://github.com/drodil/backstage-plugin-qeta/issues/227)


### Bug Fixes

* article styling ([ea9bf14](https://github.com/drodil/backstage-plugin-qeta/commit/ea9bf1473a2d9adb85fc315f51ab1d8938978c60))

### [3.6.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.6.0...v3.6.1) (2024-10-29)


### Bug Fixes

* remove private flag from openai package ([b97d59b](https://github.com/drodil/backstage-plugin-qeta/commit/b97d59bebc036758ec11181a02c8df6716c9ecd2))

## [3.6.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.5.1...v3.6.0) (2024-10-29)


### Features

* add openai backend module for question answers ([8db3b1c](https://github.com/drodil/backstage-plugin-qeta/commit/8db3b1cb47bcf15ae72ea2074b298d1bff8df9db))
* add support to summarize articles with AI ([3cd4713](https://github.com/drodil/backstage-plugin-qeta/commit/3cd47137653b5c9fe545ab81ccee99622e4515ec))
* allow disabling openai based on question type ([1c88dff](https://github.com/drodil/backstage-plugin-qeta/commit/1c88dffa032db86136d5869a03993450bdaeef83))


### Bug Fixes

* backstage versions in plugins ([b366631](https://github.com/drodil/backstage-plugin-qeta/commit/b366631d1d1d60acc31dab2f9d726b02e747631d))
* typescript errors from OpenAI import ([24e2912](https://github.com/drodil/backstage-plugin-qeta/commit/24e291206d7fb1953e55d853c9932c45a764709f))

### [3.5.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.5.0...v3.5.1) (2024-10-29)


### Bug Fixes

* add missing node package tsc script ([f7982c8](https://github.com/drodil/backstage-plugin-qeta/commit/f7982c8cfb831c2b396e97dbde5be2e3267068b2))

## [3.5.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.4.1...v3.5.0) (2024-10-29)


### Features

* get AI response for draft questions as well ([26cae2b](https://github.com/drodil/backstage-plugin-qeta/commit/26cae2ba917ae71d330d513d788a1cd42c09b56e)), closes [#220](https://github.com/drodil/backstage-plugin-qeta/issues/220)
* initial AI integration with extension point ([e658144](https://github.com/drodil/backstage-plugin-qeta/commit/e658144dac8bf1470359bd772143b1a9ecc9ed7f)), closes [#220](https://github.com/drodil/backstage-plugin-qeta/issues/220)


### Bug Fixes

* do not retry AI answer if it fails first time ([4cd82a2](https://github.com/drodil/backstage-plugin-qeta/commit/4cd82a22817189003613977d5625bf57281c3e8e))
* remove also back to questions page ([dce2d18](https://github.com/drodil/backstage-plugin-qeta/commit/dce2d182d8d14b720085fd6688cc2d11c9b47b9f))

### [3.4.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.4.0...v3.4.1) (2024-10-28)


### Bug Fixes

* allow removing vote from posts and answers ([2a38108](https://github.com/drodil/backstage-plugin-qeta/commit/2a38108e8da0a7232f82365778f35e03dc97b1ab)), closes [#221](https://github.com/drodil/backstage-plugin-qeta/issues/221)
* return zero stats for sqlite as it doesn't work with subqueries ([74105a5](https://github.com/drodil/backstage-plugin-qeta/commit/74105a59cef4284cc006178ff0ae8f45d3958cf7))

## [3.4.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.3.0...v3.4.0) (2024-10-28)


### Features

* add collections tab to user page ([dd88395](https://github.com/drodil/backstage-plugin-qeta/commit/dd8839536a5fcc3b77e6f56b9a9f4a07a2d5d1f5)), closes [#212](https://github.com/drodil/backstage-plugin-qeta/issues/212)
* add collections to search documents ([3b632f6](https://github.com/drodil/backstage-plugin-qeta/commit/3b632f652acd970451f9f9ef24a2a5272bb7a958)), closes [#217](https://github.com/drodil/backstage-plugin-qeta/issues/217)
* add moderator panel ([de31304](https://github.com/drodil/backstage-plugin-qeta/commit/de3130463c756f49a620a7f9a2b80f717f30f72c)), closes [#192](https://github.com/drodil/backstage-plugin-qeta/issues/192)
* add pagination to tags page ([c26d045](https://github.com/drodil/backstage-plugin-qeta/commit/c26d045b77a5fcfac3e2b7f246b6da1a8f284a31)), closes [#211](https://github.com/drodil/backstage-plugin-qeta/issues/211)
* add support for question templates ([14a499f](https://github.com/drodil/backstage-plugin-qeta/commit/14a499fb96cedb475696bcfbec403e693cacdc56)), closes [#109](https://github.com/drodil/backstage-plugin-qeta/issues/109)
* allow following collections ([bd8fed4](https://github.com/drodil/backstage-plugin-qeta/commit/bd8fed4495f30fefc1fce1357b1f4e42d621f4e8)), closes [#214](https://github.com/drodil/backstage-plugin-qeta/issues/214)
* collect followers stats for users ([2042e52](https://github.com/drodil/backstage-plugin-qeta/commit/2042e52d93563fa07d80e0cea045807d6b9d9617))
* resolve user's display name for notifications ([8029470](https://github.com/drodil/backstage-plugin-qeta/commit/802947097d8fa099243fc41b17b9604c22d1dd05)), closes [#215](https://github.com/drodil/backstage-plugin-qeta/issues/215)
* support pagination in tags & entities ([9933040](https://github.com/drodil/backstage-plugin-qeta/commit/9933040cbd78aa576a50ffe10fb7637b3c9d52be)), closes [#211](https://github.com/drodil/backstage-plugin-qeta/issues/211)
* wrap notification sending to async method not to wait for response ([1b9f950](https://github.com/drodil/backstage-plugin-qeta/commit/1b9f95067f3e441d1fd0b6f75ce8b387d29476f3))


### Bug Fixes

* show tag and entity related highlights ([15cebc9](https://github.com/drodil/backstage-plugin-qeta/commit/15cebc9d5891bee6b460079f5d34e01b8d2a63e0))
* typescript errors ([afd2785](https://github.com/drodil/backstage-plugin-qeta/commit/afd2785c1d422d3c5fe3b43afb8bc45288857905))

## [3.3.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.2.1...v3.3.0) (2024-10-24)


### Features

* add attachments clean up ([0fdc217](https://github.com/drodil/backstage-plugin-qeta/commit/0fdc2175cf4358f719ddf1bae40ba041fbce940c)), closes [#205](https://github.com/drodil/backstage-plugin-qeta/issues/205)
* add support to follow users ([9e96111](https://github.com/drodil/backstage-plugin-qeta/commit/9e961111947ebb20483f239d0b6ce36b7d3a82ed)), closes [#198](https://github.com/drodil/backstage-plugin-qeta/issues/198)


### Bug Fixes

* add tag description when adding new tags ([6727a3e](https://github.com/drodil/backstage-plugin-qeta/commit/6727a3e5f8b61ddc89725e2e4c764716f428db62))
* missing images array in tests ([cbc3669](https://github.com/drodil/backstage-plugin-qeta/commit/cbc3669ff6582a98ab50c7c7b99d2c8051d78838))
* missing mock for following users ([8b6b935](https://github.com/drodil/backstage-plugin-qeta/commit/8b6b93583e4c9c03be31d742cc77e71d8b769660))
* voting questions does not work ([bca1e0a](https://github.com/drodil/backstage-plugin-qeta/commit/bca1e0a9ab2dcc230ea608279100299100581464))

### [3.2.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.2.0...v3.2.1) (2024-10-23)


### Bug Fixes

* articles routing + notifications ([f431698](https://github.com/drodil/backstage-plugin-qeta/commit/f431698af48e24d78faf0ce8c79e6f04dbd4de25)), closes [#208](https://github.com/drodil/backstage-plugin-qeta/issues/208)
* correct link from articles to write page if no posts ([848a0e0](https://github.com/drodil/backstage-plugin-qeta/commit/848a0e02f66cb3921f0f4cccf66c86005d57a695)), closes [#206](https://github.com/drodil/backstage-plugin-qeta/issues/206)
* do not send notifications twice for mentions ([46b2369](https://github.com/drodil/backstage-plugin-qeta/commit/46b23698feba52d8fd97fc3689182aadd9c35d34))
* do not show tags and entities without any posts ([fb00b4b](https://github.com/drodil/backstage-plugin-qeta/commit/fb00b4b45ba0300f603434471521b341bcfd2d6e))
* exclude current user views from impact ([d169511](https://github.com/drodil/backstage-plugin-qeta/commit/d169511e48bc9fa3cec4b1a8377784c9aaa41774))
* statistics to return zero if data is missing ([498f590](https://github.com/drodil/backstage-plugin-qeta/commit/498f5905154c4f8380db4b575fa422ce889104bc)), closes [#207](https://github.com/drodil/backstage-plugin-qeta/issues/207)

## [3.2.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.1.1...v3.2.0) (2024-10-22)


### Features

* add support to tag people ([d2cda03](https://github.com/drodil/backstage-plugin-qeta/commit/d2cda03681b763afb361f868d16d34f466c320ab)), closes [#86](https://github.com/drodil/backstage-plugin-qeta/issues/86)
* add tag updater to automatically set descriptions for usually used tags ([279c4b0](https://github.com/drodil/backstage-plugin-qeta/commit/279c4b06cba70a8439c450b29df380565dbae1ff))
* allow mentioning users also in comments ([9d9ccf6](https://github.com/drodil/backstage-plugin-qeta/commit/9d9ccf6eff33864002282cff258e21e584e14787))


### Bug Fixes

* add warning panel if question has invalid type ([e1edd9f](https://github.com/drodil/backstage-plugin-qeta/commit/e1edd9faef36284ba6fc1ee364cea315658d6b85))

### [3.1.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.1.0...v3.1.1) (2024-10-22)


### Bug Fixes

* article header image sizing ([eb24d1a](https://github.com/drodil/backstage-plugin-qeta/commit/eb24d1ab339757a8c36fde99c90da2c41fffa723))

## [3.1.0](https://github.com/drodil/backstage-plugin-qeta/compare/v3.0.1...v3.1.0) (2024-10-22)


### Features

* add more overridable components ([abbba2d](https://github.com/drodil/backstage-plugin-qeta/commit/abbba2d551315b037e9448fa6718f6d6e8ba7251))
* allow overriding some component styles, more to come ([705db0b](https://github.com/drodil/backstage-plugin-qeta/commit/705db0bffb15569d0b16cdac9da796c99f724f91))

### [3.0.1](https://github.com/drodil/backstage-plugin-qeta/compare/v3.0.0...v3.0.1) (2024-10-22)


### Bug Fixes

* couple of fixes to UI ([bd5efee](https://github.com/drodil/backstage-plugin-qeta/commit/bd5efee03de3bd0ce21af336214eac497fe2ec0c))

## [3.0.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.15.0...v3.0.0) (2024-10-22)


### ⚠ BREAKING CHANGES

* most of the UI components have been moved to the react
package. this should allow the plugin users to use some of the elements
directly in their app for better integration.
* api has been moved to the common package.
this allows to use the q&a api also from the backend
modules such as the search collator which is also refactored.
* the /questions API is now /posts thus making
this a breaking change. additionally, the naming of permissions has
changed accordingly.

### Features

* add support for collections ([d12b49c](https://github.com/drodil/backstage-plugin-qeta/commit/d12b49cc0127c3dd13b0ec50e7a58da2e8ce1900)), closes [#189](https://github.com/drodil/backstage-plugin-qeta/issues/189)
* add support to post articles ([8b1d3a8](https://github.com/drodil/backstage-plugin-qeta/commit/8b1d3a87db816b8619dda101b22b5784569e0717)), closes [#188](https://github.com/drodil/backstage-plugin-qeta/issues/188)
* add users page ([a77600a](https://github.com/drodil/backstage-plugin-qeta/commit/a77600a778d6e1a87b6a77b94814416a2d4e1b7a)), closes [#190](https://github.com/drodil/backstage-plugin-qeta/issues/190)
* backend work ready for articles ([547b4fe](https://github.com/drodil/backstage-plugin-qeta/commit/547b4feba33a4d1c7baeacb9784b279dadb88d2e)), closes [#188](https://github.com/drodil/backstage-plugin-qeta/issues/188)
* new styles for tag and entity chips and pages ([16bfce6](https://github.com/drodil/backstage-plugin-qeta/commit/16bfce6e33f70ba7685886feee9080b73da20092))
* rename questions table in database to posts ([7a17516](https://github.com/drodil/backstage-plugin-qeta/commit/7a17516f1b30107b46d2e15d4bbc0af6cb1cd710)), closes [#188](https://github.com/drodil/backstage-plugin-qeta/issues/188)


### Bug Fixes

* add index for the type column ([3366201](https://github.com/drodil/backstage-plugin-qeta/commit/3366201d3fc680735bf46781360e41ebee763233))
* entity left menu icon ([4d4b526](https://github.com/drodil/backstage-plugin-qeta/commit/4d4b5265068c6afd6fca156772ec30ef06d51c88))
* left menu button paper not showing ([18d83a7](https://github.com/drodil/backstage-plugin-qeta/commit/18d83a751a4a92377fcacf34d61e4f1894026308))
* make menu more responsive on small screens ([5b72df9](https://github.com/drodil/backstage-plugin-qeta/commit/5b72df9596dacd022089b0f549e260bda8c84752))
* markdown renderer to follow theme ([7748eb3](https://github.com/drodil/backstage-plugin-qeta/commit/7748eb38f6e669aea2b0ea5d9ad8dec6afd7cb9a)), closes [#203](https://github.com/drodil/backstage-plugin-qeta/issues/203)
* posts tests ([4626388](https://github.com/drodil/backstage-plugin-qeta/commit/462638810375ea800ee43a79dd9cd28e146243d5))
* show todays stats in real time for statistics response ([cf0c762](https://github.com/drodil/backstage-plugin-qeta/commit/cf0c76222cb9f2dbc65a55ef980ffabf1943a819))
* small fix for vote buttons styling ([36d175b](https://github.com/drodil/backstage-plugin-qeta/commit/36d175b9a875130381b45ed68cc0725c959d3892))
* small tuning for post chips ([1cdecf1](https://github.com/drodil/backstage-plugin-qeta/commit/1cdecf17ec456f62d3c755e6d5f1803d26c1cf8a))
* statistics endpoint to return only question stats ([44dcc78](https://github.com/drodil/backstage-plugin-qeta/commit/44dcc782c5c8e8d4ad0ea71b31c43fd3e4905d5f))


* move api and client to common package ([4d6ab3e](https://github.com/drodil/backstage-plugin-qeta/commit/4d6ab3e8a64f7e374f007a164270be35af978370)), closes [#197](https://github.com/drodil/backstage-plugin-qeta/issues/197)
* move most of the react components to react package ([671a87a](https://github.com/drodil/backstage-plugin-qeta/commit/671a87aae3397551c8c9b978d1281d128fd8210a)), closes [#197](https://github.com/drodil/backstage-plugin-qeta/issues/197)

## [2.15.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.14.0...v2.15.0) (2024-10-18)


### Features

* add week impact to home page ([61de927](https://github.com/drodil/backstage-plugin-qeta/commit/61de92749873d8a3debd2c05449fa0345dba8f66))
* allow hiding some stats by clicking the legend ([bbb2aef](https://github.com/drodil/backstage-plugin-qeta/commit/bbb2aef79fe0e89fd532aa7b1966642b4604afdd))


### Bug Fixes

* answer list styling ([e2446e2](https://github.com/drodil/backstage-plugin-qeta/commit/e2446e28b5db063e2d70f43fd3738a2df896732f))
* list spacing ([f3c87be](https://github.com/drodil/backstage-plugin-qeta/commit/f3c87be59209fce0f7e755576730ebaf6133ed59))
* missing icon in charts ([b359d71](https://github.com/drodil/backstage-plugin-qeta/commit/b359d719a4eb0a6875ef7365fa92335a6727e758))

## [2.14.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.13.1...v2.14.0) (2024-10-18)


### Features

* add support for syntax highlighting ([a3bb0fa](https://github.com/drodil/backstage-plugin-qeta/commit/a3bb0fabf852d670545b969c0f708627869529a3))
* show also real time data for user/global stats ([b3d97f0](https://github.com/drodil/backstage-plugin-qeta/commit/b3d97f086582bad698a3ff1f51da5b4e20728f39))

### [2.13.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.13.0...v2.13.1) (2024-10-18)

## [2.13.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.12.0...v2.13.0) (2024-10-17)


### Features

* show user and global stats in the UI ([dbf5c96](https://github.com/drodil/backstage-plugin-qeta/commit/dbf5c96fffd076fd75a43e2209e86f7a0e9a3fb7))

## [2.12.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.11.0...v2.12.0) (2024-10-17)


### Features

* add stats collector job for global and users stats ([fcc9946](https://github.com/drodil/backstage-plugin-qeta/commit/fcc994627cd6ef41d43ccaf98cbea39e01ad6561))


### Bug Fixes

* missing funcs in router test ([482160c](https://github.com/drodil/backstage-plugin-qeta/commit/482160ccf2ff04bf67fb95119b977fa1a5afa5d2))

## [2.11.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.10.3...v2.11.0) (2024-10-17)


### Features

* modify UI to have left menu for features ([498747e](https://github.com/drodil/backstage-plugin-qeta/commit/498747e2366739c410fe169e901263e6018b7554))
* more ui tuning for questions ([edcda4b](https://github.com/drodil/backstage-plugin-qeta/commit/edcda4be182458d2af08bcaf0e25aedb28d2bfaa))


### Bug Fixes

* missing a from ask question ([aecdafc](https://github.com/drodil/backstage-plugin-qeta/commit/aecdafc50f198c892feafc4900e760cca0390ebf))
* unnecessary score in question list item ([570cdec](https://github.com/drodil/backstage-plugin-qeta/commit/570cdec3cdcc111141cc091340d4c374b6d428d0))
* voting to return right value for user ([62051eb](https://github.com/drodil/backstage-plugin-qeta/commit/62051eb7dd6bc050e115c5378f70f430d9d73279))

### [2.10.3](https://github.com/drodil/backstage-plugin-qeta/compare/v2.10.2...v2.10.3) (2024-10-15)

### [2.10.2](https://github.com/drodil/backstage-plugin-qeta/compare/v2.10.1...v2.10.2) (2024-10-04)


### Bug Fixes

* streamline the notifications to prevent duplicates ([92da2e4](https://github.com/drodil/backstage-plugin-qeta/commit/92da2e49be5dc3fcf9cd3bfe0987d7228e23ced5))

### [2.10.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.10.0...v2.10.1) (2024-10-03)


### Bug Fixes

* wrong read permission for answers ([9f30557](https://github.com/drodil/backstage-plugin-qeta/commit/9f30557ded9c89da0f4ef477877da70899c06499))

## [2.10.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.9.1...v2.10.0) (2024-10-01)


### Features

* add followed entities list to home page ([9042e9a](https://github.com/drodil/backstage-plugin-qeta/commit/9042e9ab5571534bb47339bea0151ddb9e39892e))
* allow following also entities ([031c576](https://github.com/drodil/backstage-plugin-qeta/commit/031c576a1e26e3dc9fe5183bceefb67aab7569a3))

### [2.9.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.9.0...v2.9.1) (2024-09-18)


### Bug Fixes

* force compression level to fix cache key generation ([8ad1944](https://github.com/drodil/backstage-plugin-qeta/commit/8ad1944849b34de7f89af497313b1e4361a1acc4))
* lock file ([c6da53e](https://github.com/drodil/backstage-plugin-qeta/commit/c6da53ea8f69031cefbc0c23bdeb5f1016eaa6b5))
* lock file cache key wants to update ([ac68f7a](https://github.com/drodil/backstage-plugin-qeta/commit/ac68f7a59a79efcc6538446d2620c51a8e237f99))
* remove yarn cache from use node ([4363a2e](https://github.com/drodil/backstage-plugin-qeta/commit/4363a2e6fcb8f5047b6b15c95ba44209e543e1d3))
* utils test ([f82f870](https://github.com/drodil/backstage-plugin-qeta/commit/f82f870c604a5a48844db05cbb07eb7ddb7f7ef5))

## [2.9.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.8.1...v2.9.0) (2024-09-12)


### Features

* change to permission framework ([a33963d](https://github.com/drodil/backstage-plugin-qeta/commit/a33963d7cedecdfa87c721968d675e31ff6fd43d))
* support old permissions if permission service not available ([3b2686b](https://github.com/drodil/backstage-plugin-qeta/commit/3b2686bde14f436b11dcfafff3557b99e9f37d63))


### Bug Fixes

* add missing margin to follow tags button ([32479fc](https://github.com/drodil/backstage-plugin-qeta/commit/32479fc0d3040cf7a01ff23909df227bc8e50bf9))
* lists with permissions framework ([3d7771c](https://github.com/drodil/backstage-plugin-qeta/commit/3d7771c69d5eb1eb4b736e0be20e1776fdf49eee))
* tags break in followed tags list ([dab563b](https://github.com/drodil/backstage-plugin-qeta/commit/dab563b7628352459dcb14fc4727f0202b17d38f))

### [2.8.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.8.0...v2.8.1) (2024-09-06)


### Bug Fixes

* add node-fetch types ([128572e](https://github.com/drodil/backstage-plugin-qeta/commit/128572ee3cd285387a897af1d31989dde8583bd1))
* node-fetch downgrade ([65669c0](https://github.com/drodil/backstage-plugin-qeta/commit/65669c02f687fcf5fb499168dd9ba35505ec8ac5))

## [2.8.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.7.1...v2.8.0) (2024-09-05)


### Features

* add more fields to collated search documents ([57c35ea](https://github.com/drodil/backstage-plugin-qeta/commit/57c35eabc48377d12745ab356f0ebd3ca8b0fb29))
* add scaffolder module for tag following ([a57d012](https://github.com/drodil/backstage-plugin-qeta/commit/a57d01231c137ae7708fb7db5c5859b150eea03b))
* allow users to follow tags ([7afc790](https://github.com/drodil/backstage-plugin-qeta/commit/7afc7902c00479fb282d368a29140dcc3032922f))

### [2.7.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.7.0...v2.7.1) (2024-09-03)


### Bug Fixes

* unmounting the navigation confirm ([c12dc66](https://github.com/drodil/backstage-plugin-qeta/commit/c12dc664062bddc948d4f27e602861cb26790044))
* user profile image loading ([7bc0284](https://github.com/drodil/backstage-plugin-qeta/commit/7bc02843365cb474a5c9061f3252a5e099b2b794))

## [2.7.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.6.0...v2.7.0) (2024-08-28)


### Features

* prevent user from navigating away by accident ([13a492d](https://github.com/drodil/backstage-plugin-qeta/commit/13a492d84e3becc1f2e39554fe2b70a38791f18e))


### Bug Fixes

* order catalog entities request ([bfedc0a](https://github.com/drodil/backstage-plugin-qeta/commit/bfedc0a958bb26f561fb15e4732851213fe10f07))
* remove markdown from notification description ([ed26060](https://github.com/drodil/backstage-plugin-qeta/commit/ed26060ec3f98855a37a60fc0f3890bd1341fcb9))

## [2.6.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.5.3...v2.6.0) (2024-08-23)


### Features

* add i18n support for translations ([dd3a449](https://github.com/drodil/backstage-plugin-qeta/commit/dd3a449cdf4d303be7755fdaf1fd4ad1b5f653d7)), closes [#137](https://github.com/drodil/backstage-plugin-qeta/issues/137)


### Bug Fixes

* docs to have real translation keys ([b3792b4](https://github.com/drodil/backstage-plugin-qeta/commit/b3792b4832d71672ece302a0428ffd5aaea5c89a))
* remove deprecated functionalities ([0670663](https://github.com/drodil/backstage-plugin-qeta/commit/0670663d016d100a0abf1f12556de3f318bc3a62))
* use error call for router ([331caaf](https://github.com/drodil/backstage-plugin-qeta/commit/331caaf4486bb84cefa728c03df149bbe5ee4935))

### [2.5.3](https://github.com/drodil/backstage-plugin-qeta/compare/v2.5.2...v2.5.3) (2024-08-20)


### Bug Fixes

* remove root logger ([05027af](https://github.com/drodil/backstage-plugin-qeta/commit/05027afd5606e0648e592be67b9b29612d585d65))

### [2.5.2](https://github.com/drodil/backstage-plugin-qeta/compare/v2.5.1...v2.5.2) (2024-07-31)


### Bug Fixes

* fetch user info in batches for questions and answers ([66dbd97](https://github.com/drodil/backstage-plugin-qeta/commit/66dbd97a5d2a4e7de219437b0f8b5bae4d3050ba))

### [2.5.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.5.0...v2.5.1) (2024-07-22)


### Bug Fixes

* user answers loading ([462acf8](https://github.com/drodil/backstage-plugin-qeta/commit/462acf8f99869b6a038e5e6609babde9a891e52d))

## [2.5.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.4.2...v2.5.0) (2024-07-22)


### Features

* show users answers in the user page ([60dcea2](https://github.com/drodil/backstage-plugin-qeta/commit/60dcea2540eaefddee3f83935c884e68becd3b33)), closes [#174](https://github.com/drodil/backstage-plugin-qeta/issues/174)


### Bug Fixes

* allow marking correct answers with service token ([e63d607](https://github.com/drodil/backstage-plugin-qeta/commit/e63d607eb530d00c03c87f3f078e577b077a14bd)), closes [#172](https://github.com/drodil/backstage-plugin-qeta/issues/172)

### [2.4.2](https://github.com/drodil/backstage-plugin-qeta/compare/v2.4.1...v2.4.2) (2024-06-19)

### [2.4.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.4.0...v2.4.1) (2024-06-13)


### Bug Fixes

* attachments response for different engines ([50b6af6](https://github.com/drodil/backstage-plugin-qeta/commit/50b6af61d27aba6eaf5148b0f9fbeb6cfb252360)), closes [#163](https://github.com/drodil/backstage-plugin-qeta/issues/163)
* exclude current user from notification recipients ([4939f55](https://github.com/drodil/backstage-plugin-qeta/commit/4939f55980a294933c88bbdd5069a5698f399a66))
* migrate search collator to new backend ([fb199bc](https://github.com/drodil/backstage-plugin-qeta/commit/fb199bcf04b7996d7c6266e2cf1f003f9369ebe2)), closes [#167](https://github.com/drodil/backstage-plugin-qeta/issues/167)

## [2.4.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.3.2...v2.4.0) (2024-06-04)


### Features

* date range filter added to Questions Filters ([88e24ef](https://github.com/drodil/backstage-plugin-qeta/commit/88e24effcd91cac3535efb18fa0ade8cc679d966))


### Bug Fixes

* styling for date range filter ([0c2e0e7](https://github.com/drodil/backstage-plugin-qeta/commit/0c2e0e7b504d77e00bf4802437ab55f2812d6e9f))

### [2.3.2](https://github.com/drodil/backstage-plugin-qeta/compare/v2.3.1...v2.3.2) (2024-05-27)


### Bug Fixes

* image download broken after migrate to new backend system with default auth policy ([7bdb52a](https://github.com/drodil/backstage-plugin-qeta/commit/7bdb52a2f702750ed5b19f57fcea92ec2a285a42))

### [2.3.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.3.0...v2.3.1) (2024-05-15)

## [2.3.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.2.1...v2.3.0) (2024-05-06)


### Features

* also send notification to other commenters of q/a ([222fc25](https://github.com/drodil/backstage-plugin-qeta/commit/222fc25f0200c5c4d823e86a1abbe6efb90a3c18))


### Bug Fixes

* fixes issue [#154](https://github.com/drodil/backstage-plugin-qeta/issues/154), showing entity filter dropdown after entity is selected ([310747d](https://github.com/drodil/backstage-plugin-qeta/commit/310747dd5d8d4d0b3bc6a1bbd0127e1eaa75166a))
* removing duplicate entity refs when selected entity exist ([e7db2b9](https://github.com/drodil/backstage-plugin-qeta/commit/e7db2b9cbac94d24282ef5c302e6fa98639eba83))

### [2.2.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.2.0...v2.2.1) (2024-04-24)


### Bug Fixes

* move anonymous check to AuthorLink to prevent error in useEntityPresentation ([21bc099](https://github.com/drodil/backstage-plugin-qeta/commit/21bc099a2c944b8f07fca6f3dd73d1084156c2cc))

## [2.2.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.1.1...v2.2.0) (2024-04-23)


### Features

* Add support for aws session token ([091abf5](https://github.com/drodil/backstage-plugin-qeta/commit/091abf54519f4b210da91cff8cb5600648011593))
* allow defining more properties to HomePage ([56f9691](https://github.com/drodil/backstage-plugin-qeta/commit/56f969183f2a8a61cd1222a6809c0ebaeb3f71bb))


### Bug Fixes

* no questions button to include tags ([0430733](https://github.com/drodil/backstage-plugin-qeta/commit/0430733b19bbf5f4def244ca5fcd7bc3e8d43b46))

### [2.1.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.1.0...v2.1.1) (2024-04-18)


### Bug Fixes

* improve notification descriptions ([15ed009](https://github.com/drodil/backstage-plugin-qeta/commit/15ed009e03b059896b09bd8f7283a4db9d4a5681))

## [2.1.0](https://github.com/drodil/backstage-plugin-qeta/compare/v2.0.1...v2.1.0) (2024-04-17)


### Features

* add notifications support ([fb378fe](https://github.com/drodil/backstage-plugin-qeta/commit/fb378fe9a895ef3d2f557ac778b196081c4eda38))


### Bug Fixes

* test fixes ([13ba94a](https://github.com/drodil/backstage-plugin-qeta/commit/13ba94af02cf9924783f7fce6bcfe7ca957b338b))
* typescript issues ([d4ff99f](https://github.com/drodil/backstage-plugin-qeta/commit/d4ff99fdbe56301fa9bcce81cb3025df89c3b395))

### [2.0.1](https://github.com/drodil/backstage-plugin-qeta/compare/v2.0.0...v2.0.1) (2024-04-15)


### Bug Fixes

* remove stickiness from highlight list headers ([0d863ab](https://github.com/drodil/backstage-plugin-qeta/commit/0d863ab1641ea0af0c5c19a838c76d045fea019e))
* use fetch api to upload attachments ([8cb301d](https://github.com/drodil/backstage-plugin-qeta/commit/8cb301d98e2e243cabefaa7bdd29e8d592e12e06))

## [2.0.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.24.5...v2.0.0) (2024-04-02)


### ⚠ BREAKING CHANGES

* change to use the new backend system

### Features

* change to use the new backend system ([91c09b4](https://github.com/drodil/backstage-plugin-qeta/commit/91c09b4c2620a5f1912da8a2033217dafd420a2d))

### [1.24.5](https://github.com/drodil/backstage-plugin-qeta/compare/v1.24.4...v1.24.5) (2024-04-01)


### Bug Fixes

* pre-filter questions list with selected tag from tags page ([dda9a9e](https://github.com/drodil/backstage-plugin-qeta/commit/dda9a9eb03394da26057d9ffd33005ec8afdcf56))

### [1.24.4](https://github.com/drodil/backstage-plugin-qeta/compare/v1.24.3...v1.24.4) (2024-03-30)


### Bug Fixes

* allowed tags filtering + allow underscore separator for tags ([cc3a4fe](https://github.com/drodil/backstage-plugin-qeta/commit/cc3a4feb7a6ee4510a312b1ff4522d88b3f1f57d)), closes [#139](https://github.com/drodil/backstage-plugin-qeta/issues/139)
* s3 to use region even without access keys ([a83cec5](https://github.com/drodil/backstage-plugin-qeta/commit/a83cec5a2ace97897880c07d14442d78ee975081))

### [1.24.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.24.2...v1.24.3) (2024-03-26)

### [1.24.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.24.1...v1.24.2) (2024-03-26)


### Bug Fixes

* remove unnecessary logs ([66483fd](https://github.com/drodil/backstage-plugin-qeta/commit/66483fd5a6dc604ee8188023c09c38785b1be176))

### [1.24.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.24.0...v1.24.1) (2024-03-26)


### Bug Fixes

* add default exports for module and backend ([5d449a0](https://github.com/drodil/backstage-plugin-qeta/commit/5d449a075a795e3ef00895a3cf4bf2b26588672e))

## [1.24.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.23.3...v1.24.0) (2024-03-25)


### Features

* add s3 as storage backend ([f34fd30](https://github.com/drodil/backstage-plugin-qeta/commit/f34fd30f679aeeb34740c6739c17696719192b9f))
* allow defining theme id for the home page ([2299139](https://github.com/drodil/backstage-plugin-qeta/commit/2299139f728dab45f12a0d0731c518a38f619069)), closes [#129](https://github.com/drodil/backstage-plugin-qeta/issues/129)
* allow filtering with multiple tags ([e08c851](https://github.com/drodil/backstage-plugin-qeta/commit/e08c851b47e466c825f8eda48c4367bd115cbffa))


### Bug Fixes

* change s3 config to optional and check on runtime ([c71794f](https://github.com/drodil/backstage-plugin-qeta/commit/c71794fe4c67e39ff7d5282143088c89ef12297a))

### [1.23.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.23.2...v1.23.3) (2024-02-27)


### Bug Fixes

* score update when voting ([56d5d9d](https://github.com/drodil/backstage-plugin-qeta/commit/56d5d9dc2694945ba62514284deacfa87df19233)), closes [#124](https://github.com/drodil/backstage-plugin-qeta/issues/124)

### [1.23.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.23.1...v1.23.2) (2024-02-22)


### Bug Fixes

* add missing signals for answer post and removal ([edddc77](https://github.com/drodil/backstage-plugin-qeta/commit/edddc7785c93c9c16427f620cc534926de0129ff))

### [1.23.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.23.0...v1.23.1) (2024-02-22)


### Bug Fixes

* make sure author is user entity before using entity presentation ([dcd0b6e](https://github.com/drodil/backstage-plugin-qeta/commit/dcd0b6e04b350ea2ea25d160e86223631d6e3c40))

## [1.23.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.22.1...v1.23.0) (2024-02-22)


### Features

* add support for real time stats with signals ([672877b](https://github.com/drodil/backstage-plugin-qeta/commit/672877b81bfc8e0fe89b5b48d01638c1b0ea9e28))


### Bug Fixes

* add support for signals in new backend system ([2f2e6d5](https://github.com/drodil/backstage-plugin-qeta/commit/2f2e6d5ffb3e54ca612d3d21772345bc7518a35f))
* failing test due to backstage update ([4943cf9](https://github.com/drodil/backstage-plugin-qeta/commit/4943cf950beb10ba5b2f94ac945895246e9bf240))

### [1.22.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.22.0...v1.22.1) (2024-02-16)


### Bug Fixes

* selected correct answer color ([dca5329](https://github.com/drodil/backstage-plugin-qeta/commit/dca5329bb8a289064514cb5c9d3780c58a368422))

## [1.22.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.21.1...v1.22.0) (2024-02-05)


### Features

* add analytics events to search ([5d817bf](https://github.com/drodil/backstage-plugin-qeta/commit/5d817bf9e1730139a7cee9b0e9fc38a04b2e00b8))


### Bug Fixes

* prettier ([32b3195](https://github.com/drodil/backstage-plugin-qeta/commit/32b3195b7724fc16bc49b5b481e178cd67bdb71f))
* validate router id parameters to be numbers ([f897010](https://github.com/drodil/backstage-plugin-qeta/commit/f8970102c439b705cab0abf89055c36112ac7c10))

### [1.21.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.21.0...v1.21.1) (2024-01-30)


### Bug Fixes

* move name setting to effect hook ([25dddf3](https://github.com/drodil/backstage-plugin-qeta/commit/25dddf33a154b2a74b2a7b3fb456cbd3b9a45fca))
* undefined default for name ([94a1148](https://github.com/drodil/backstage-plugin-qeta/commit/94a1148336cfd6a57419dfa7211473cbc0a07c32))

## [1.21.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.20.0...v1.21.0) (2024-01-30)


### Features

* update question list UI ([f694751](https://github.com/drodil/backstage-plugin-qeta/commit/f69475162e81867eca3649bb2923fc72bee0c618))


### Bug Fixes

* scoll to top of question list on page change ([62633c8](https://github.com/drodil/backstage-plugin-qeta/commit/62633c89171e3ce6b4f51ec76c2241c2dd9d4522)), closes [#119](https://github.com/drodil/backstage-plugin-qeta/issues/119)

## [1.20.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.19.2...v1.20.0) (2024-01-23)


### Features

* add tag filter to filter panel ([df2eea7](https://github.com/drodil/backstage-plugin-qeta/commit/df2eea7de90eced3bb50cf1b2b79c03e45864d88)), closes [#117](https://github.com/drodil/backstage-plugin-qeta/issues/117)


### Bug Fixes

* couple of routing fixes for filters ([77752e1](https://github.com/drodil/backstage-plugin-qeta/commit/77752e12dd3956f2808898e1aa26210bc8ecbe2b))
* routing between main and component pages ([afc087c](https://github.com/drodil/backstage-plugin-qeta/commit/afc087c73d3de79e568225e6c017f50a6640a34a))

### [1.19.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.19.1...v1.19.2) (2024-01-23)


### Bug Fixes

* multiple fixes to filtering of entity ([2a1dbe5](https://github.com/drodil/backstage-plugin-qeta/commit/2a1dbe5b5ed4375ba4f20f7532d4b80edb660721))

### [1.19.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.19.0...v1.19.1) (2024-01-23)


### Bug Fixes

* add missing tsc command to react ([f749714](https://github.com/drodil/backstage-plugin-qeta/commit/f749714d5af7d08f2e92aa2147e629b14a274787))

## [1.19.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.8...v1.19.0) (2024-01-23)


### Features

* add entity filter to the list view ([b39b3c4](https://github.com/drodil/backstage-plugin-qeta/commit/b39b3c4273212c94d3fc6e8587333cee2c06b493)), closes [#116](https://github.com/drodil/backstage-plugin-qeta/issues/116)
* move no questions to own component ([68000ba](https://github.com/drodil/backstage-plugin-qeta/commit/68000bae57c9ea8308561e8243c394485fa46c4d))
* separate routes to react plugin ([66d498f](https://github.com/drodil/backstage-plugin-qeta/commit/66d498fa8a842551927787959a2040b692228708))


### Bug Fixes

* add missing func to router test ([b95b8f9](https://github.com/drodil/backstage-plugin-qeta/commit/b95b8f9cc5a91686887ae97335315c942a46cb5a))
* change moderators to be optional config ([2b6e8e5](https://github.com/drodil/backstage-plugin-qeta/commit/2b6e8e5316f773087be628bd4aba5bb5938ae950))
* remove unnecessary path to entity with query ([e883da1](https://github.com/drodil/backstage-plugin-qeta/commit/e883da18072fa78b3476a3d0157a7bca1480addb))

### [1.18.8](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.7...v1.18.8) (2024-01-17)


### Bug Fixes

* allow service-to-service requests to questions ([d77be6f](https://github.com/drodil/backstage-plugin-qeta/commit/d77be6f8da74fb000b3130e5ef4eaeae5df98e5f))

### [1.18.7](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.6...v1.18.7) (2024-01-17)


### Bug Fixes

* add ordering of questions to collator ([6dab457](https://github.com/drodil/backstage-plugin-qeta/commit/6dab457a8c51389b14a268bdfa51183d594925fd))

### [1.18.6](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.5...v1.18.6) (2024-01-17)


### Bug Fixes

* anonymous allow fix for authentication ([ae9948a](https://github.com/drodil/backstage-plugin-qeta/commit/ae9948aeb178d0f60819cbcc34dd1e546b609cba))
* authentication + paginate search collator ([d69ad12](https://github.com/drodil/backstage-plugin-qeta/commit/d69ad128ba29536793aa0d0d07f60233662eb8f0))
* check for undefined questions response ([060c7e5](https://github.com/drodil/backstage-plugin-qeta/commit/060c7e5a45ad8c2c8ca2ed95ed28ffbbcb71c276))
* use correct json response from routes ([5ca8149](https://github.com/drodil/backstage-plugin-qeta/commit/5ca8149bd3c8da9fb1bc7cfd0a0a68185b8c7563))

### [1.18.5](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.4...v1.18.5) (2024-01-16)


### Bug Fixes

* collator headers ([d9f1b21](https://github.com/drodil/backstage-plugin-qeta/commit/d9f1b21947b731c3b85b9da44e0f536770fa6e49))

### [1.18.4](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.3...v1.18.4) (2024-01-15)


### Bug Fixes

* add token manager as deps to new backend plugin ([599cef0](https://github.com/drodil/backstage-plugin-qeta/commit/599cef0e85646cf8a16c7a2b0fcff2653f0c5052))

### [1.18.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.2...v1.18.3) (2024-01-15)


### Bug Fixes

* allow service-to-service auth with new search collator ([158bbde](https://github.com/drodil/backstage-plugin-qeta/commit/158bbde3d8f81ef00e393fba8dff5284b185a1f4))

### [1.18.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.1...v1.18.2) (2024-01-11)


### Bug Fixes

* reference to explore plugin in config ([1c6e1a7](https://github.com/drodil/backstage-plugin-qeta/commit/1c6e1a781901acbd7f76325d863b9f47e8492366))
* standard version to bump search module ([05634ef](https://github.com/drodil/backstage-plugin-qeta/commit/05634efbb2a36fd488ddb646be4600f1285c6c27))

### [1.18.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.18.0...v1.18.1) (2024-01-11)


### Bug Fixes

* prefix the plugin name with backstage ([881650c](https://github.com/drodil/backstage-plugin-qeta/commit/881650ce03afe48442f5213d265d86abc710fec2))

## [1.18.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.17.0...v1.18.0) (2024-01-11)


### Features

* introduce new search backend module for q&a ([1dc0809](https://github.com/drodil/backstage-plugin-qeta/commit/1dc0809a7c59cf822975f157ca14ba65986b8969)), closes [#106](https://github.com/drodil/backstage-plugin-qeta/issues/106)


### Bug Fixes

* force correct answer color ([1f48626](https://github.com/drodil/backstage-plugin-qeta/commit/1f48626aae70924db18f7f85a7ac6b0956eb77fc))

## [1.17.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.16.5...v1.17.0) (2024-01-08)


### Features

* allow copying link to questions and answers ([93b21f2](https://github.com/drodil/backstage-plugin-qeta/commit/93b21f2929d08320ba99737de02eeb51ce8e89ce)), closes [#104](https://github.com/drodil/backstage-plugin-qeta/issues/104)


### Bug Fixes

* handle search string ending with colon ([5e0248f](https://github.com/drodil/backstage-plugin-qeta/commit/5e0248fed6883269adc9c1e5d63fd222b48fedfc)), closes [#110](https://github.com/drodil/backstage-plugin-qeta/issues/110)

### [1.16.5](https://github.com/drodil/backstage-plugin-qeta/compare/v1.16.4...v1.16.5) (2024-01-08)

### [1.16.4](https://github.com/drodil/backstage-plugin-qeta/compare/v1.16.3...v1.16.4) (2023-11-15)


### Bug Fixes

* go to q&a user page instead catalog ([bd6e6c2](https://github.com/drodil/backstage-plugin-qeta/commit/bd6e6c2a51278846e4189aac4dd97a91ec73a3d5))

### [1.16.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.16.2...v1.16.3) (2023-11-15)


### Bug Fixes

* add missing lodash types ([f98470d](https://github.com/drodil/backstage-plugin-qeta/commit/f98470db9837669ea40766c5613eaf53832b1f90))
* same button order for question page ([d8007df](https://github.com/drodil/backstage-plugin-qeta/commit/d8007dfc47552c95e7d2e7b0c09de9e4875281f3))
* set anonymous to false for old questions ([c91a90d](https://github.com/drodil/backstage-plugin-qeta/commit/c91a90d8df1e2bc28cda07956d2f451239445548))
* yarn lock ([bb5c4d1](https://github.com/drodil/backstage-plugin-qeta/commit/bb5c4d125c658ef6e485ee798eec7fc67fb29984))

### [1.16.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.16.1...v1.16.2) (2023-10-16)

### [1.16.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.16.0...v1.16.1) (2023-10-16)


### Bug Fixes

* export routes from qeta plugin ([db683a4](https://github.com/drodil/backstage-plugin-qeta/commit/db683a4ec58f7c0dc6527179469448faae86ae4c))

## [1.16.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.15.4...v1.16.0) (2023-10-16)


### Features

* add events from deleting questions and answers ([fdd5d01](https://github.com/drodil/backstage-plugin-qeta/commit/fdd5d012c20053c1c777a16294366873cef3a271)), closes [#99](https://github.com/drodil/backstage-plugin-qeta/issues/99)
* Added support for new backend system ([f08a1ba](https://github.com/drodil/backstage-plugin-qeta/commit/f08a1ba9761482426832a7f9f0e0105645c07c42))
* allow asking and answering anonymously ([9bb602b](https://github.com/drodil/backstage-plugin-qeta/commit/9bb602b9a0f46237e2d3721ff3d140a7f4ac2849)), closes [#93](https://github.com/drodil/backstage-plugin-qeta/issues/93)
* allow sorting answers ([5c41b12](https://github.com/drodil/backstage-plugin-qeta/commit/5c41b128c95b87a51911da09083a5c9740a0dd2a)), closes [#88](https://github.com/drodil/backstage-plugin-qeta/issues/88)
* export search document from common package ([f9e495a](https://github.com/drodil/backstage-plugin-qeta/commit/f9e495a43517b212458015c2228557661325ed01))


### Bug Fixes

* build error with new  plugin.ts file ([6037b4d](https://github.com/drodil/backstage-plugin-qeta/commit/6037b4d3f5d1119b8327a432573d520d36716871))

### [1.15.4](https://github.com/drodil/backstage-plugin-qeta/compare/v1.15.3...v1.15.4) (2023-09-26)


### Bug Fixes

* remove margin from first and last child of markdown ([de3f08d](https://github.com/drodil/backstage-plugin-qeta/commit/de3f08d91d0e7864025741aaeb9dcd7d23a441fb))
* use same padding for preview as it is for writing ([0e5480e](https://github.com/drodil/backstage-plugin-qeta/commit/0e5480e352fced2a3789d3744fe8505f79261fef))

### [1.15.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.15.2...v1.15.3) (2023-09-26)


### Bug Fixes

* remove styling from headers in markdown content ([42308df](https://github.com/drodil/backstage-plugin-qeta/commit/42308df4be6771b218e98f0d6a6515a98a672a75))

### [1.15.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.15.1...v1.15.2) (2023-09-26)


### Bug Fixes

* preview styling to use backstage styles ([b1414f6](https://github.com/drodil/backstage-plugin-qeta/commit/b1414f6e3b6f12505bad9af8b0c14b5810d2c974))

### [1.15.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.15.0...v1.15.1) (2023-09-22)


### Bug Fixes

* yarn.lock conflicts ([d0cdac8](https://github.com/drodil/backstage-plugin-qeta/commit/d0cdac8c32e2e7fe4296adfa705c2cbe63947ac2))

## [1.15.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.14.1...v1.15.0) (2023-08-02)


### Features

* more global access management ([f078b34](https://github.com/drodil/backstage-plugin-qeta/commit/f078b342d50885eac96395fd7a6611f9263333d1)), closes [#81](https://github.com/drodil/backstage-plugin-qeta/issues/81) [#75](https://github.com/drodil/backstage-plugin-qeta/issues/75)


### Bug Fixes

* global edit checks in routes ([902c2a4](https://github.com/drodil/backstage-plugin-qeta/commit/902c2a42f19ae771521294a33d85b709e420b7cb))

### [1.14.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.14.0...v1.14.1) (2023-07-31)


### Bug Fixes

* add separate name for permissions ([cd944c4](https://github.com/drodil/backstage-plugin-qeta/commit/cd944c484e0bfddf8a74610ef42095f4361003af)), closes [#83](https://github.com/drodil/backstage-plugin-qeta/issues/83)
* disable buttons on post ([8dce2f4](https://github.com/drodil/backstage-plugin-qeta/commit/8dce2f45c5deac30747ff8d8cf6d0d8c919ec1f6)), closes [#76](https://github.com/drodil/backstage-plugin-qeta/issues/76)
* lock file ([29b3e32](https://github.com/drodil/backstage-plugin-qeta/commit/29b3e3231281d19957c4f25edd8ba4ace3c46dba))

## [1.14.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.13.3...v1.14.0) (2023-07-13)


### Features

* add tests for comment routes ([d36d339](https://github.com/drodil/backstage-plugin-qeta/commit/d36d3399e80b9661f501677074436f4445d66229))
* allow user to be specified for GET routes via x-qeta-user header ([f85e4e0](https://github.com/drodil/backstage-plugin-qeta/commit/f85e4e0fd7dfe2f86b28fdcf030776b54055765d))
* use entity title on entity ask page ([6547e6c](https://github.com/drodil/backstage-plugin-qeta/commit/6547e6c5defff3e97bc6eb742511517bbf12b7a9))
* when allowMetadataInput is enabled, accept created and user fields ([e3b90cb](https://github.com/drodil/backstage-plugin-qeta/commit/e3b90cbf39011858b000ce8bbac20c3af5a0b319))

### [1.13.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.13.2...v1.13.3) (2023-06-27)

### [1.13.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.13.1...v1.13.2) (2023-06-22)


### Bug Fixes

* **getMostUpvotedQuestions:** fix url getMostUpvotedQuestions QetaClient ([761585d](https://github.com/drodil/backstage-plugin-qeta/commit/761585d537bac6ddfc333048aee8fb96357b7c48))

### [1.13.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.13.0...v1.13.1) (2023-06-20)


### Bug Fixes

* **bug-stats-card:** fix wrong path TopUpvotedCorrectAnswers ([f04f1cc](https://github.com/drodil/backstage-plugin-qeta/commit/f04f1ccf5c29823cd341d271ba7f2a2bb151e524))

## [1.13.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.12.0...v1.13.0) (2023-06-16)


### Features

* add stats for most questions and answers ([ab6f3fd](https://github.com/drodil/backstage-plugin-qeta/commit/ab6f3fd0de88516f5176a5720a8a30b8e9071fbe))
* add support for backstage events ([026064e](https://github.com/drodil/backstage-plugin-qeta/commit/026064e71d430b5fe05999238a9b345734316c3b)), closes [#55](https://github.com/drodil/backstage-plugin-qeta/issues/55)
* allow specifying allowed tags in app config ([ca0b443](https://github.com/drodil/backstage-plugin-qeta/commit/ca0b443ead1d78eae1eba301751a30e2c093fdba)), closes [#66](https://github.com/drodil/backstage-plugin-qeta/issues/66)


### Bug Fixes

* redirect back to entity page from question container ([85c7c24](https://github.com/drodil/backstage-plugin-qeta/commit/85c7c24c667367c5dd3e38e2b474c66b14fb8dc1)), closes [#65](https://github.com/drodil/backstage-plugin-qeta/issues/65)

## [1.12.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.11.0...v1.12.0) (2023-06-14)


### Features

* add css classes to different parts of the UI ([07294b3](https://github.com/drodil/backstage-plugin-qeta/commit/07294b3ff61af227dc4c2f25d63eef97461f710b)), closes [#66](https://github.com/drodil/backstage-plugin-qeta/issues/66)

## [1.11.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.10.3...v1.11.0) (2023-06-09)


### Features

* add statistics page and use discovery api in the client ([1ae307c](https://github.com/drodil/backstage-plugin-qeta/commit/1ae307cb21cc0b34c2511bdfc6f8ef1432d056cf))
* **statistics:** create top statistics component ([63db423](https://github.com/drodil/backstage-plugin-qeta/commit/63db4233da3dc1304dc6bc366a38f70fae3dd973))
* **statistics:** create user statistics endpoints ([60baee1](https://github.com/drodil/backstage-plugin-qeta/commit/60baee13ddcda754484abaebcede389274fde97c))
* **tests:** add tests to statistics endpoints ([038aa08](https://github.com/drodil/backstage-plugin-qeta/commit/038aa08549a0635b37f75fe6d9fa7582bbf94ca5))


### Bug Fixes

* **comments:** fix route comment ([ef18710](https://github.com/drodil/backstage-plugin-qeta/commit/ef18710da222db189f72752ac4db963b46c06927))
* few styling improvements to question page ([1f70d06](https://github.com/drodil/backstage-plugin-qeta/commit/1f70d064e7e60a2d415e4208368d3d5ef2ae9900))
* **lint:** fix tsc errors ([dbc11ad](https://github.com/drodil/backstage-plugin-qeta/commit/dbc11ad116b35a1ad074ba7e11c5387118b7247f))
* **minor:** fix locally change ([3eae89f](https://github.com/drodil/backstage-plugin-qeta/commit/3eae89fcc5c7af4fe6146f9938883ee3a720a4d5))
* tests + discovery api base url ([13c525f](https://github.com/drodil/backstage-plugin-qeta/commit/13c525f8a741a96e7a42b08ab87702c5b536e8ec))
* **tests:** fix ci tests ([05069db](https://github.com/drodil/backstage-plugin-qeta/commit/05069db3a49f8954ed36701c9d7fdd0e76b04cbc))

### [1.10.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.10.2...v1.10.3) (2023-05-23)


### Bug Fixes

* re-voting question or answer to work correctly ([462690c](https://github.com/drodil/backstage-plugin-qeta/commit/462690cab74026b7ca71fa4d18a2d4b565505593))
* yarn config for release action ([f98348a](https://github.com/drodil/backstage-plugin-qeta/commit/f98348ab1a9ac60433b08889784dfaa8a4dcf7b4))

### [1.10.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.10.1...v1.10.2) (2023-05-09)


### Bug Fixes

* yarn3 publish commands ([ed6bc9c](https://github.com/drodil/backstage-plugin-qeta/commit/ed6bc9c936e4c169da840e581e27631bcd9018bd))

### [1.10.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.10.0...v1.10.1) (2023-05-09)


### Bug Fixes

* resolution for react types ([0594b60](https://github.com/drodil/backstage-plugin-qeta/commit/0594b604fbf81c416c5f675f5cf3b8ac601aabc8))

## [1.10.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.9.4...v1.10.0) (2023-05-09)


### Features

* show truncated content of question in questions list ([3fec4e9](https://github.com/drodil/backstage-plugin-qeta/commit/3fec4e9ec710b79f158be12a29f178ffdee34161))


### Bug Fixes

* add missing character in regex ([c53a51d](https://github.com/drodil/backstage-plugin-qeta/commit/c53a51d8442538fd32ce65e090b8ff2feccc0daa))

### [1.9.4](https://github.com/drodil/backstage-plugin-qeta/compare/v1.9.3...v1.9.4) (2023-05-08)


### Bug Fixes

* correct extension parameters ([27b4c3b](https://github.com/drodil/backstage-plugin-qeta/commit/27b4c3be8c3be6d893061905b0db8f2e696d79f7))
* remove resolutions for react ([1461139](https://github.com/drodil/backstage-plugin-qeta/commit/1461139b23dcaea350a1568bca29a268b83ebcb2))

### [1.9.3](https://github.com/drodil/backstage-plugin-qeta/compare/v1.9.2...v1.9.3) (2023-05-08)


### Bug Fixes

* correct attachment location type ([8d13e08](https://github.com/drodil/backstage-plugin-qeta/commit/8d13e08e59c829866824da9ded913cb9d270a5b5))

### [1.9.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.9.1...v1.9.2) (2023-05-08)


### Bug Fixes

* add missing export for homepage component ([11fa66d](https://github.com/drodil/backstage-plugin-qeta/commit/11fa66d8310ce4a5ab06ba18a43522f01a692c7b))

### [1.9.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.9.0...v1.9.1) (2023-05-08)


### Bug Fixes

* make Q&A config optional ([bc2bb6a](https://github.com/drodil/backstage-plugin-qeta/commit/bc2bb6ac17f49919edd43f0e6114006edc3434ed))

## [1.9.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.8.0...v1.9.0) (2023-05-08)


### Features

* add questions table component and homepage card ([0ad71b9](https://github.com/drodil/backstage-plugin-qeta/commit/0ad71b9a08bec243cdf58b0b466eb6e1c2815dbb)), closes [#54](https://github.com/drodil/backstage-plugin-qeta/issues/54)
* automatic cleanup of question/answer attachments ([be447b9](https://github.com/drodil/backstage-plugin-qeta/commit/be447b9b7b09ae50ca90110ebe02ccc9ea704f64))


### Bug Fixes

* Add missing createPermissionIntegrationRouter call ([1379a01](https://github.com/drodil/backstage-plugin-qeta/commit/1379a01cebf66a4643c3c50dea38c3b1ae07a854))
* add react types as resolutions ([d972168](https://github.com/drodil/backstage-plugin-qeta/commit/d972168210a40b85f54b9748ac86c71e580c54d2))
* add react types to devDeps ([6eaeb60](https://github.com/drodil/backstage-plugin-qeta/commit/6eaeb60d51d3eb40fd22348aaf5ff80f0c17c14e))
* **local:** docker compose config ([3cdf861](https://github.com/drodil/backstage-plugin-qeta/commit/3cdf861e84f4e61e49511dfc69895a75cc734eb6))
* move back to TS 4.7 ([c2a3bdd](https://github.com/drodil/backstage-plugin-qeta/commit/c2a3bdd796e66cd1aa45fc28f33e83794dc6835e))

## [1.8.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.7.0...v1.8.0) (2023-03-27)


### Features

* support analytics from Q&A ([72fff17](https://github.com/drodil/backstage-plugin-qeta/commit/72fff1763a254d30f5dedbc3e43020e9f50e17ad)), closes [#51](https://github.com/drodil/backstage-plugin-qeta/issues/51)


### Bug Fixes

* change search collator to return only IndexableDocuments ([4642297](https://github.com/drodil/backstage-plugin-qeta/commit/46422973edec7bd7eb4fbef6aa2e1e5052d62cc8)), closes [#52](https://github.com/drodil/backstage-plugin-qeta/issues/52)

## [1.7.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.6.2...v1.7.0) (2023-03-16)


### Features

* allow commenting questions and answers ([b34be05](https://github.com/drodil/backstage-plugin-qeta/commit/b34be05e05a15ca6037ec382cc7ed6aebb44006d)), closes [#42](https://github.com/drodil/backstage-plugin-qeta/issues/42)


### Bug Fixes

* check for questions to be in the response ([1a0fffc](https://github.com/drodil/backstage-plugin-qeta/commit/1a0fffc7075b5dae9b14e9a7bee2849517a2ce4f))
* flickering on questions page due to skeleton ([0ab0673](https://github.com/drodil/backstage-plugin-qeta/commit/0ab0673da91276d47ed919759328554ce7894352))
* handle unauthorized listing properly ([6da5d08](https://github.com/drodil/backstage-plugin-qeta/commit/6da5d08cd980246801a0d2ca665107ca520366d5))
* replace skeleton in TagsContainer ([783aa32](https://github.com/drodil/backstage-plugin-qeta/commit/783aa325538b89323d1ccd2866220c773df078a5))

### [1.6.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.6.1...v1.6.2) (2023-03-15)


### Bug Fixes

* filter updated when searchQuery not changed ([afb6334](https://github.com/drodil/backstage-plugin-qeta/commit/afb63346c24d4436e46ad850af15ccd7837de91c))

### [1.6.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.6.0...v1.6.1) (2023-03-15)


### Bug Fixes

* add question page inside container ([a8ffd26](https://github.com/drodil/backstage-plugin-qeta/commit/a8ffd2600d05714d92098da25486bc3fa86b98db)), closes [#44](https://github.com/drodil/backstage-plugin-qeta/issues/44)
* contains filter for question search ([8fa9ed2](https://github.com/drodil/backstage-plugin-qeta/commit/8fa9ed2a0ba6c187dbd944c6b762fcfb799f7763))

## [1.6.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.5.1...v1.6.0) (2023-03-15)


### Features

* add support for both postgres and sqlite ([69258c8](https://github.com/drodil/backstage-plugin-qeta/commit/69258c88cce7b8f42734882b4875f5531bab4313))
* initial implementation supporting postgres ([5e1240b](https://github.com/drodil/backstage-plugin-qeta/commit/5e1240bf4d9042b085a53f109cc6e09c98522924))

### [1.5.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.5.0...v1.5.1) (2023-03-13)


### Bug Fixes

* update props for LinkButton, use basepath when navigate function is called ([a04edc1](https://github.com/drodil/backstage-plugin-qeta/commit/a04edc1b89666b4a35547fe23a69de97fb64ac62))
* update props for LinkButton, use basepath when navigate function is called ([bb01c59](https://github.com/drodil/backstage-plugin-qeta/commit/bb01c5915097232a327129fd16f1eb1b6b02d482))

## [1.5.0](https://github.com/drodil/backstage-plugin-qeta/compare/v0.1.24...v1.5.0) (2023-03-07)


### Features

* add hot questions list ([66e33b8](https://github.com/drodil/backstage-plugin-qeta/commit/66e33b8e079a10ba0fcde0e6fb7b01d4e590ca0e))
* add optional permissions framework to the plugin ([6c60c24](https://github.com/drodil/backstage-plugin-qeta/commit/6c60c24203b9cd090d11850b253cf4588ef440a7)), closes [#41](https://github.com/drodil/backstage-plugin-qeta/issues/41)
* add shortcut to users own questions ([78fb4c6](https://github.com/drodil/backstage-plugin-qeta/commit/78fb4c607ad646e42f4d0bb432a00043b89bb9fc)), closes [#32](https://github.com/drodil/backstage-plugin-qeta/issues/32)
* allow ask form to have callback after posting question ([39a7716](https://github.com/drodil/backstage-plugin-qeta/commit/39a771614d821d4ad890b1c60b4e39a846acb8f1))
* allow deleting questions and answers ([2ffdd12](https://github.com/drodil/backstage-plugin-qeta/commit/2ffdd125bd4d8a37792db8bc511e48f7b792ac73)), closes [#6](https://github.com/drodil/backstage-plugin-qeta/issues/6)
* allow editing of answers ([ec3705b](https://github.com/drodil/backstage-plugin-qeta/commit/ec3705b50457b113b32aa7c76fca0f84160f31bd)), closes [#5](https://github.com/drodil/backstage-plugin-qeta/issues/5)
* allow fetching questions by component ([e68767d](https://github.com/drodil/backstage-plugin-qeta/commit/e68767db6b418f7bc1ba73d6764f8519a1b5f2a0))
* allow filtering entity kinds with config ([d23e12a](https://github.com/drodil/backstage-plugin-qeta/commit/d23e12a529b8fe56a9ab812fd218ca3b98d7e1eb)), closes [#18](https://github.com/drodil/backstage-plugin-qeta/issues/18) [#17](https://github.com/drodil/backstage-plugin-qeta/issues/17)
* allow filtering with no votes ([98c57ef](https://github.com/drodil/backstage-plugin-qeta/commit/98c57ef12c3dac45ab67a227a1213d1dc37b2193)), closes [#4](https://github.com/drodil/backstage-plugin-qeta/issues/4)
* allow selecting number of questions in list ([43741c6](https://github.com/drodil/backstage-plugin-qeta/commit/43741c65139bb6791f5243e3e2b3f58b03d28e21)), closes [#19](https://github.com/drodil/backstage-plugin-qeta/issues/19)
* allow setting entity to ask in URL param ([f297e63](https://github.com/drodil/backstage-plugin-qeta/commit/f297e633e7040a4408c3a0508e5a08197fae53c4))
* allow setting qeta page title and subtitle ([c2a2ebf](https://github.com/drodil/backstage-plugin-qeta/commit/c2a2ebf3540341e5b55cb3958fa701139380cea3)), closes [#23](https://github.com/drodil/backstage-plugin-qeta/issues/23)
* allow showing title in question container ([e3b98d0](https://github.com/drodil/backstage-plugin-qeta/commit/e3b98d0169b51dbfed66487974ad1f01a2e06be6))
* allow specifying component for ask form ([19e7a9b](https://github.com/drodil/backstage-plugin-qeta/commit/19e7a9bdeba8a4786d33f5e92e990d79bab0d4e2))
* allow specifying own title for question container ([417a15a](https://github.com/drodil/backstage-plugin-qeta/commit/417a15a0697232e474ad9f0a7967000359d71833))
* allow users to edit questions ([e8d5923](https://github.com/drodil/backstage-plugin-qeta/commit/e8d5923db1fd9acb78b0115cba71ef3d096e8aec)), closes [#5](https://github.com/drodil/backstage-plugin-qeta/issues/5)
* allow users to favorite questions ([33cc0f6](https://github.com/drodil/backstage-plugin-qeta/commit/33cc0f64e3e3fa9c2e5ff31b5c6a500a40fda1a9)), closes [#33](https://github.com/drodil/backstage-plugin-qeta/issues/33)
* format all entities the same way ([4937da9](https://github.com/drodil/backstage-plugin-qeta/commit/4937da990f429c10fb8d2480ad1a0adfd58f4b59))
* group entities in ask form autocomplete by kind ([6838e32](https://github.com/drodil/backstage-plugin-qeta/commit/6838e32d165beead9c829e7ca0d34462c3e5ea6c))
* improve hot question trend rating ([a1ea2bf](https://github.com/drodil/backstage-plugin-qeta/commit/a1ea2bf60ff68e773972a2123394b5273725da0f))
* refactor author showing in question page ([129a197](https://github.com/drodil/backstage-plugin-qeta/commit/129a197d046aca0f095022122a7342b2955cc026))
* remember filter panel options ([384c378](https://github.com/drodil/backstage-plugin-qeta/commit/384c378a5c43dec9f592477b76ba64d4fb9acd4d)), closes [#15](https://github.com/drodil/backstage-plugin-qeta/issues/15)
* show linked entities in question list ([0cef37d](https://github.com/drodil/backstage-plugin-qeta/commit/0cef37d58b71cf4ac71aa33cc0d2c21665680173))


### Bug Fixes

* add common bump version config ([97a4c56](https://github.com/drodil/backstage-plugin-qeta/commit/97a4c56033b8d4d6b1ff5d02aaa15e181c776a9b))
* add missing mock for question update ([290c210](https://github.com/drodil/backstage-plugin-qeta/commit/290c210b71efc90fcbd7b1c9cd2570956a00bc53))
* allow voting multiple q&a ([532e7cd](https://github.com/drodil/backstage-plugin-qeta/commit/532e7cd7b34dbca56fd499cc02431971b5ec26aa)), closes [#28](https://github.com/drodil/backstage-plugin-qeta/issues/28)
* app-config ([fee6754](https://github.com/drodil/backstage-plugin-qeta/commit/fee67546adc94c4cb97f24b2f4f65d8baa1a1de9))
* change the components to entities ([c92f7ef](https://github.com/drodil/backstage-plugin-qeta/commit/c92f7ef5aab967b47d2a855564e217c65e5b69eb))
* change the search collator to only return answer contents ([32a3833](https://github.com/drodil/backstage-plugin-qeta/commit/32a3833d4918e1e38fcbb2e846012baf078f246d))
* delete button to be a link ([c265f8e](https://github.com/drodil/backstage-plugin-qeta/commit/c265f8ec6d456bd82bf4afaa7307dd4cb5775493))
* entity title in utils ([ae12125](https://github.com/drodil/backstage-plugin-qeta/commit/ae1212543afb1d41a48d7b7896114f58fffaf9ce))
* export QetaApi for external use ([53b089d](https://github.com/drodil/backstage-plugin-qeta/commit/53b089dbd4714b86fc13ab39cb2a1d823570d088))
* mkdocs ([ccc4d3a](https://github.com/drodil/backstage-plugin-qeta/commit/ccc4d3a3fa689cf4736ff8e15026e9aadd1778c5))
* no new question when editing ([80b8fde](https://github.com/drodil/backstage-plugin-qeta/commit/80b8fde1fe2e47b9d752b390794ac567b5ec9fe1))
* questions without correct answer query ([d09aea1](https://github.com/drodil/backstage-plugin-qeta/commit/d09aea1069ea7bd9eb12018f31b8ff04fb5d4fbd)), closes [#26](https://github.com/drodil/backstage-plugin-qeta/issues/26)
* references to components ([5475f7e](https://github.com/drodil/backstage-plugin-qeta/commit/5475f7ec82612cc4a9b52c5421922fe76dd6c937))
* remove deprecated versions from changelog ([77ef862](https://github.com/drodil/backstage-plugin-qeta/commit/77ef8627f44dbf5d58e09440c376ad4dc422f19a))
* remove optional from tags routing ([94ff27b](https://github.com/drodil/backstage-plugin-qeta/commit/94ff27b50d37da1eda56d78ab53c8516564cd879)), closes [#27](https://github.com/drodil/backstage-plugin-qeta/issues/27)
* show total number of questions in question container ([c5d078e](https://github.com/drodil/backstage-plugin-qeta/commit/c5d078e0c4382c7f86713fc51c609119680b4931))
* styling when long answer given without word breaks ([e4bb89b](https://github.com/drodil/backstage-plugin-qeta/commit/e4bb89bd5b4e2dda3cdc5edbb8cd9bae3c652882))
* support for node18 ([8a712e5](https://github.com/drodil/backstage-plugin-qeta/commit/8a712e5cedb59f25a39eab496dc0b6860cb5e428))
* top padding of question card ([d73642d](https://github.com/drodil/backstage-plugin-qeta/commit/d73642db7dfd8dd526be9b7e8a3be5b88dc48e9c))
* use primary color for buttons ([73c4e32](https://github.com/drodil/backstage-plugin-qeta/commit/73c4e3208f8791fbe462774445580b108feb9398)), closes [#37](https://github.com/drodil/backstage-plugin-qeta/issues/37)
* use relative url to question location from search collator ([c6a9cb7](https://github.com/drodil/backstage-plugin-qeta/commit/c6a9cb7790c985c4ee24fb55b2c0c3e1a261452d)), closes [#29](https://github.com/drodil/backstage-plugin-qeta/issues/29)
* vote buttons tooltip for questions ([c40729e](https://github.com/drodil/backstage-plugin-qeta/commit/c40729e35f1fa1d77bc9670cf6654e394d27ea0f))

### [1.4.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.4.0...v1.4.1) (2023-02-17)


### Bug Fixes

* top padding of question card ([014540b](https://github.com/drodil/backstage-plugin-qeta/commit/014540b30d1bff9e8b7d01f5fdab05321fb08f5a))

## [1.4.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.3.1...v1.4.0) (2023-02-13)


### Features

* group entities in ask form autocomplete by kind ([f690903](https://github.com/drodil/backstage-plugin-qeta/commit/f690903a0f5251cb5414ff03b73cd92b1c2d928a))


### Bug Fixes

* styling when long answer given without word breaks ([9240ca4](https://github.com/drodil/backstage-plugin-qeta/commit/9240ca482cb0f8d9dd6ed1242c79a75cc5de224a))

### [1.3.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.3.0...v1.3.1) (2023-02-07)


### Bug Fixes

* use primary color for buttons ([b06436c](https://github.com/drodil/backstage-plugin-qeta/commit/b06436c3e4abff79c1c106f6a944ad6262a159c1)), closes [#37](https://github.com/drodil/backstage-plugin-qeta/issues/37)

## [1.3.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.2.2...v1.3.0) (2023-02-01)


### Features

* add shortcut to users own questions ([f3d34a2](https://github.com/drodil/backstage-plugin-qeta/commit/f3d34a218e78ae451a12a656a6f405975ce6b89b)), closes [#32](https://github.com/drodil/backstage-plugin-qeta/issues/32)
* allow selecting number of questions in list ([1607e85](https://github.com/drodil/backstage-plugin-qeta/commit/1607e85080efce274677854e80b050b0a6ce7d7f)), closes [#19](https://github.com/drodil/backstage-plugin-qeta/issues/19)
* allow users to favorite questions ([25a82e9](https://github.com/drodil/backstage-plugin-qeta/commit/25a82e9f8bb86b6a4dfadd5f647850238ff88ff3)), closes [#33](https://github.com/drodil/backstage-plugin-qeta/issues/33)

### [1.2.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.2.1...v1.2.2) (2023-01-20)

### [1.2.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.2.0...v1.2.1) (2023-01-18)


### Bug Fixes

* use relative url to question location from search collator ([16a8d10](https://github.com/drodil/backstage-plugin-qeta/commit/16a8d106c66fb5c8696737f27c40ba673113fcb5)), closes [#29](https://github.com/drodil/backstage-plugin-qeta/issues/29)

## [1.2.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.1.2...v1.2.0) (2023-01-17)


### Features

* add hot questions list ([b07a314](https://github.com/drodil/backstage-plugin-qeta/commit/b07a3145832497f65176582e237ba1a78d12139d))
* allow showing title in question container ([300ecbc](https://github.com/drodil/backstage-plugin-qeta/commit/300ecbc773f257f0143d5cd7d891157651a285c0))
* allow specifying own title for question container ([72fe0ef](https://github.com/drodil/backstage-plugin-qeta/commit/72fe0efd07ad7feab153897a544d894faa52ed2e))
* format all entities the same way ([e79bf3f](https://github.com/drodil/backstage-plugin-qeta/commit/e79bf3f12701e18651cf58f47019e8bd62ac92cb))
* improve hot question trend rating ([065797d](https://github.com/drodil/backstage-plugin-qeta/commit/065797d041222a251bf6e59ce9a6c3b319d08228))


### Bug Fixes

* entity title in utils ([4b4e435](https://github.com/drodil/backstage-plugin-qeta/commit/4b4e4359a58d577832437b79abc06dc8799dd6a6))

### [1.1.2](https://github.com/drodil/backstage-plugin-qeta/compare/v1.1.1...v1.1.2) (2023-01-16)


### Bug Fixes

* allow voting multiple q&a ([c49c086](https://github.com/drodil/backstage-plugin-qeta/commit/c49c0867ade8374b1644163165a2d50f98bee414)), closes [#28](https://github.com/drodil/backstage-plugin-qeta/issues/28)

### [1.1.1](https://github.com/drodil/backstage-plugin-qeta/compare/v1.1.0...v1.1.1) (2023-01-13)


### Bug Fixes

* questions without correct answer query ([5634943](https://github.com/drodil/backstage-plugin-qeta/commit/5634943e7798241f18826036c8150a466349a33f)), closes [#26](https://github.com/drodil/backstage-plugin-qeta/issues/26)
* remove optional from tags routing ([956bcbf](https://github.com/drodil/backstage-plugin-qeta/commit/956bcbf0740108342fcbc67b29a18f8f9413485c)), closes [#27](https://github.com/drodil/backstage-plugin-qeta/issues/27)

## [1.1.0](https://github.com/drodil/backstage-plugin-qeta/compare/v1.0.1...v1.1.0) (2023-01-10)


### Features

* allow setting qeta page title and subtitle ([e9d306b](https://github.com/drodil/backstage-plugin-qeta/commit/e9d306b3bb52cf6917246ff07c22d60b9b9cc15e)), closes [#23](https://github.com/drodil/backstage-plugin-qeta/issues/23)


### Bug Fixes

* remove deprecated versions from changelog ([21c7f3a](https://github.com/drodil/backstage-plugin-qeta/commit/21c7f3a97f9ecde98ed4ff52bf476e6eaefcaea5))

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
