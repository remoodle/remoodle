# Changelog

## [2.2.3](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.2.2...remoodle/backend-v2.2.3) (2025-02-16)


### Bug Fixes

* clean up defaults ([1ea88cc](https://github.com/remoodle/remoodle/commit/1ea88cc7d02e2e88d83977de4b90e6b496af7e24))

## [2.2.2](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.2.1...remoodle/backend-v2.2.2) (2025-02-15)


### Bug Fixes

* **api:** throw 401 after failed token validation ([fce4a57](https://github.com/remoodle/remoodle/commit/fce4a577f23779313f665c593b0f9bb16f46edef))

## [2.2.1](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.2.0...remoodle/backend-v2.2.1) (2025-02-12)


### Code Refactoring

* update notifications schema ([554fdba](https://github.com/remoodle/remoodle/commit/554fdbad86849d6382d068aaf5a74e4b3f4bee2d))

## [2.2.0](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.1.1...remoodle/backend-v2.2.0) (2025-02-12)


### Features

* **cluster:** add scheduler failover mechanism ([2900a9b](https://github.com/remoodle/remoodle/commit/2900a9ba490f8442885ce05a9e931d26c42be8f2))


### Bug Fixes

* **cluster:** add retries to job scheduler ([ed76828](https://github.com/remoodle/remoodle/commit/ed768282e010b810123b85925dbf37356e5c02ea))
* **cluster:** prevent potential rescheduling ([ba54183](https://github.com/remoodle/remoodle/commit/ba54183013e85b765d49b19d6ee99b6ec2d4f227))


### Miscellaneous Chores

* **api,cluster:** update bullmq ([5afacd0](https://github.com/remoodle/remoodle/commit/5afacd0ddf556e43db932e0e1d4b617ff07dba8c))
* **cluster:** remove useless logs ([6a510a1](https://github.com/remoodle/remoodle/commit/6a510a1935cd0f973460478fd346d2a6039b4447))

## [2.1.1](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.1.0...remoodle/backend-v2.1.1) (2025-02-11)


### Bug Fixes

* **api:** show zod validation errors ([3631eaf](https://github.com/remoodle/remoodle/commit/3631eafd6f5ad21fcdaaeb135934448865f8da44))

## [2.1.0](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.16...remoodle/backend-v2.1.0) (2025-02-11)


### Features

* add username validation ([1e119cc](https://github.com/remoodle/remoodle/commit/1e119cccaefccd04fbf3efc1dc85a5b85022ab80))

## [2.0.16](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.15...remoodle/backend-v2.0.16) (2025-02-10)


### Code Refactoring

* **api,cluster,front,tgbot:** update notificationSettings schema ([fa24ca8](https://github.com/remoodle/remoodle/commit/fa24ca896bc45e49ee6d81dd39b922b8e6bbbf25))

## [2.0.15](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.14...remoodle/backend-v2.0.15) (2025-02-09)


### Miscellaneous Chores

* add eon-x2 config ([f3f6948](https://github.com/remoodle/remoodle/commit/f3f6948a2c176095b1cb82030e3b145b826731ca))
* lower grades sync to 10 minutes ([06a9321](https://github.com/remoodle/remoodle/commit/06a932133c852dbe31448b0a88f1b7afda30dd41))

## [2.0.14](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.13...remoodle/backend-v2.0.14) (2025-02-09)


### Miscellaneous Chores

* **cluster:** change configs ([bed3dd8](https://github.com/remoodle/remoodle/commit/bed3dd865f9cdab7bd6dbb17b58d60ac5681ab03))

## [2.0.13](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.12...remoodle/backend-v2.0.13) (2025-02-08)


### Bug Fixes

* **cluster:** pass correct payload ([4e8a8aa](https://github.com/remoodle/remoodle/commit/4e8a8aa0c7394586bb70190621b1d2635a796ff2))


### Miscellaneous Chores

* add bundle step ([550439f](https://github.com/remoodle/remoodle/commit/550439f4286530720484e03efc060236af81c6ad))
* **backend:** omit bundle step ([e85cbc4](https://github.com/remoodle/remoodle/commit/e85cbc4fa3eab2b3c4e7ff7b43a9ffa7a5a457a5))
* **clsuter:** add stage and prod configs ([8b45730](https://github.com/remoodle/remoodle/commit/8b457302ec9436d03f95b725d63994f827f2118c))
* dont bundle json ([bf93de0](https://github.com/remoodle/remoodle/commit/bf93de028c23cfce959034e7857d642c1fbda225))
* kek ([50d5665](https://github.com/remoodle/remoodle/commit/50d56653b578f2ff555d2f437cfbf6add23840d1))

## [2.0.12](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.11...remoodle/backend-v2.0.12) (2025-02-05)


### Bug Fixes

* filter out dead users ([fa88587](https://github.com/remoodle/remoodle/commit/fa88587186924d19390d4283e5103c7eb3fcb352))

## [2.0.11](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.10...remoodle/backend-v2.0.11) (2025-02-05)


### Bug Fixes

* try to speed up grades flow ([539ed51](https://github.com/remoodle/remoodle/commit/539ed51ea71f9db8157bb8cf0aea472db83c5941))

## [2.0.10](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.9...remoodle/backend-v2.0.10) (2025-02-04)


### Bug Fixes

* ya dolbaeb ([aee3ec6](https://github.com/remoodle/remoodle/commit/aee3ec68b0510ae035a72b563238313a593a482c))

## [2.0.9](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.8...remoodle/backend-v2.0.9) (2025-02-04)


### Bug Fixes

* **cluster:** add telegram retries ([536b7c9](https://github.com/remoodle/remoodle/commit/536b7c974a1dfbce4967be71af35fece7009e5a3))

## [2.0.8](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.7...remoodle/backend-v2.0.8) (2025-02-04)


### Bug Fixes

* add notingroup error handler ([294fcf3](https://github.com/remoodle/remoodle/commit/294fcf3c6203f51e251eecd12f0006db640cb923))
* add notingroup to api response ([0aa3b82](https://github.com/remoodle/remoodle/commit/0aa3b827a8bdf7507e07836051cc9e300ff12fe5))
* handle course update properly ([f72fe16](https://github.com/remoodle/remoodle/commit/f72fe165a5698a3b000049e2e025f91ff35cf66a))
* pin pnpm in corepack ([b21b9df](https://github.com/remoodle/remoodle/commit/b21b9df8e58a209ffc8439fe10d47a46944ec97b))

## [2.0.7](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.6...remoodle/backend-v2.0.7) (2025-01-28)


### Bug Fixes

* keep much less jobs ([6113881](https://github.com/remoodle/remoodle/commit/61138811c3c4caa5beac819e6015dfb5d5abbced))

## [2.0.6](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.5...remoodle/backend-v2.0.6) (2025-01-23)


### Bug Fixes

* get rid of csrf ([bc31ab7](https://github.com/remoodle/remoodle/commit/bc31ab7a5468492175280b5da3f02032d5cd99fa))

## [2.0.5](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.4...remoodle/backend-v2.0.5) (2025-01-22)


### Bug Fixes

* handle regular login properly ([8930f9f](https://github.com/remoodle/remoodle/commit/8930f9f1dee5a451556bbe4039fa0c0ffeed4fe4))

## [2.0.4](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.3...remoodle/backend-v2.0.4) (2025-01-22)


### Bug Fixes

* pass lifo to the children jobs ([253914f](https://github.com/remoodle/remoodle/commit/253914f4c983b1bb94f1f4dc0a87953a597500a6))

## [2.0.3](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.2...remoodle/backend-v2.0.3) (2025-01-22)


### Bug Fixes

* expose Version header ([c934096](https://github.com/remoodle/remoodle/commit/c93409645dccaedb6ab9ce4df800ce91d0b71528))
* prioritize properly ([4b93164](https://github.com/remoodle/remoodle/commit/4b931645d7813c8397eb88d5d189552c05df03e1))
* use seconds for removeOnComplete api ([053fbd0](https://github.com/remoodle/remoodle/commit/053fbd0324842d1e7e06ccaba117dd523541cd35))


### Code Refactoring

* move bull-board to api ([a34ff14](https://github.com/remoodle/remoodle/commit/a34ff14c385ed89aec9b0a71faaa1bb9068bb300))
* move configs to it's folder ([b1e94fc](https://github.com/remoodle/remoodle/commit/b1e94fc4c3e54f2d665ac01857c6a5d18200393f))
* use same import ([168a642](https://github.com/remoodle/remoodle/commit/168a642f5e0ffef9c2e47a56346c3e940ccdb809))

## [2.0.2](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.1...remoodle/backend-v2.0.2) (2025-01-21)


### Bug Fixes

* replace errors with HTTPExceptions ([1af480e](https://github.com/remoodle/remoodle/commit/1af480e4757afe76977208f4c9ff73508eaf2b6f))

## [2.0.1](https://github.com/remoodle/remoodle/compare/remoodle/backend-v2.0.0...remoodle/backend-v2.0.1) (2025-01-20)


### Bug Fixes

* add telegram login ([7f0a3f1](https://github.com/remoodle/remoodle/commit/7f0a3f1331b9d2a6051337bbd44f96128597fbc1))
* **api:** sort deadlines ([63e4bb3](https://github.com/remoodle/remoodle/commit/63e4bb3a1c0bf9947ee92b1c9cdbe0f4ca158fd3))
* correct typo ([20ed97f](https://github.com/remoodle/remoodle/commit/20ed97fad4f70ac829555e5e7db8aa2b4412ce9d))
* handle unordered thresholds properly ([79261ec](https://github.com/remoodle/remoodle/commit/79261ecf02be63275a4f198ae7f65f8fa042ac09))


### Code Refactoring

* remove reminders sync ([5ebc5ce](https://github.com/remoodle/remoodle/commit/5ebc5ce95a8828cff37808049c6389d65d9b0182))
* simplify condition ([826c899](https://github.com/remoodle/remoodle/commit/826c899a05161d2c115ed34a58d48cc55ad0ffdf))

## [2.0.0](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.7.2...remoodle/backend-v2.0.0) (2025-01-14)


### ⚠ BREAKING CHANGES

* bump major version

### Features

* add ability to pass job data to grades scheduler ([2c2c6c5](https://github.com/remoodle/remoodle/commit/2c2c6c5c7d598315ad68975ec3726b20b949e384))
* add health system ([42a86e3](https://github.com/remoodle/remoodle/commit/42a86e3141afe8d8b68561dd156dac9c426b85d2))
* **backend,db,types:** introduce cluster ([f50cc04](https://github.com/remoodle/remoodle/commit/f50cc04bbb83c8e6008ed7bcee07c33195a07f80))
* bump major version ([45a32dd](https://github.com/remoodle/remoodle/commit/45a32dde74c8bb0c651245ad9c9b9b6858dd95ee))
* **cluster:** add health endpoint ([665ca4c](https://github.com/remoodle/remoodle/commit/665ca4cfa7abe9488c9a9063bd2df5e9f1ce78f4))
* support health recovery ([da29a2e](https://github.com/remoodle/remoodle/commit/da29a2e5c72b0c5fbf4c8d1281c49616f11b8a85))


### Bug Fixes

* allow telegram account swap ([68fef9a](https://github.com/remoodle/remoodle/commit/68fef9ad198340888813d6dd42d8c9a299a3209f))
* better return values ([07d3598](https://github.com/remoodle/remoodle/commit/07d35980612fa419c2c690827702a834b4472777))
* bump api version ([7c10e86](https://github.com/remoodle/remoodle/commit/7c10e865b48305eaa95999f9e3932c127852f5f9))
* concise returnvalues ([1eafa82](https://github.com/remoodle/remoodle/commit/1eafa827545848abdf0c0e7a8abe4270c56fcea6))
* correct typings ([fdfa281](https://github.com/remoodle/remoodle/commit/fdfa2814c39edb4e9b146707df9d87efcf4f980c))
* find user properly ([825976f](https://github.com/remoodle/remoodle/commit/825976f75e166524c16db6f503256fad84c67ec8))
* handle deadlines properly ([4353fb4](https://github.com/remoodle/remoodle/commit/4353fb4774c54a31bff9ed255ba2e25ba17c8db1))
* handle flows correctly ([6f6567c](https://github.com/remoodle/remoodle/commit/6f6567c788f7d24c0f86d8d69e737a1deb0bc071))
* handle scheduled updates properly ([ccd4dd1](https://github.com/remoodle/remoodle/commit/ccd4dd12d08a2884a6aa45773a7aa3d733d90972))
* revert condition ([e4349b2](https://github.com/remoodle/remoodle/commit/e4349b27ed7592c3774dcbe12af3d5cedeffb69e))
* set _id as default handle ([eb88b5f](https://github.com/remoodle/remoodle/commit/eb88b5f9c3525a4d621fcacc42e081292c361010))
* sync events properly ([213fc1d](https://github.com/remoodle/remoodle/commit/213fc1d80fb4cd9850a61f6ad990b7a10ce60cb5))


### Reverts

* **cluster:** remove heath endpoint ([ac9c891](https://github.com/remoodle/remoodle/commit/ac9c89130039c45f24cbbf1da54ccc2419368871))


### Miscellaneous Chores

* **deps:** upgade bullmq ([49984a7](https://github.com/remoodle/remoodle/commit/49984a74dd97471030a908b4e4ece4778e14fcb3))


### Code Refactoring

* reduce deadlines overhead ([be70369](https://github.com/remoodle/remoodle/commit/be70369388c01083c453deb75d79e46151ca7769))
* tie up api and cluster ([21b190f](https://github.com/remoodle/remoodle/commit/21b190f1f4078e16dc3fff6ac40dcadcaf6145aa))

## [1.7.2](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.7.1...remoodle/backend-v1.7.2) (2024-12-19)


### Bug Fixes

* invert filter logic ([2c94dd2](https://github.com/remoodle/remoodle/commit/2c94dd271441c6262dfbd8ab47095ff5d58fbba9))

## [1.7.1](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.7.0...remoodle/backend-v1.7.1) (2024-12-19)


### Code Refactoring

* filter out irrelevant deadlines in rmc-sdk ([bd409c2](https://github.com/remoodle/remoodle/commit/bd409c2e77f90b66c89a8d389423687fd652aae4))

## [1.7.0](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.6.3...remoodle/backend-v1.7.0) (2024-11-17)


### Features

* add metrics on backend ([#269](https://github.com/remoodle/remoodle/issues/269)) ([94a8585](https://github.com/remoodle/remoodle/commit/94a85854187666242c3f2a1b40118de2f4dbabd1))


### Miscellaneous Chores

* trigger actions ([d0e77c3](https://github.com/remoodle/remoodle/commit/d0e77c398ce031b41670112c7dc048ace9dff0f9))

## [1.6.3](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.6.2...remoodle/backend-v1.6.3) (2024-11-11)


### Bug Fixes

* remove shit ([1e6fb1f](https://github.com/remoodle/remoodle/commit/1e6fb1f59380b1a108d0ae5ce88bdd752d0f09e0))

## [1.6.2](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.6.1...remoodle/backend-v1.6.2) (2024-11-10)


### Bug Fixes

* handle wrong grade updates ([f53b4c3](https://github.com/remoodle/remoodle/commit/f53b4c356fef4e81d95306684e3b2abc3d24d0cf))

## [1.6.1](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.6.0...remoodle/backend-v1.6.1) (2024-11-10)


### Bug Fixes

* graded and submitted deadlines ([f695054](https://github.com/remoodle/remoodle/commit/f695054bb35224489833f713409b8af41049e5df))
* more optionals ([b07dc40](https://github.com/remoodle/remoodle/commit/b07dc40af17f575a871b5fd6e040a35e96c6d3ef))

## [1.6.0](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.5.0...remoodle/backend-v1.6.0) (2024-11-10)


### Features

* clear button under notification ([#244](https://github.com/remoodle/remoodle/issues/244)) ([b0ea261](https://github.com/remoodle/remoodle/commit/b0ea2618b7bee3fd186050e074e2bffef66fcf83))

## [1.5.0](https://github.com/remoodle/remoodle/compare/remoodle/backend-v1.4.10...remoodle/backend-v1.5.0) (2024-10-25)


### Features

* add days limit and filter by courseId for deadlines ([#223](https://github.com/remoodle/remoodle/issues/223)) ([9b7bf2e](https://github.com/remoodle/remoodle/commit/9b7bf2e9ad1462b5db4ebee75ad7f1fcc667d7a4))

## [1.4.10](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.9...remoodle/backend-v1.4.10) (2024-10-05)


### Bug Fixes

* **notifier:** add formatting and max grade support ([acdc658](https://github.com/remoodle/heresy/commit/acdc658d4f0d085022e1a48cb68ce1922a8df80c))

## [1.4.9](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.8...remoodle/backend-v1.4.9) (2024-10-03)


### Bug Fixes

* make it possible to delete ghost accounts ([e581f81](https://github.com/remoodle/heresy/commit/e581f81daf2943a5ce3b9411ccffde306f92bf9f))

## [1.4.8](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.7...remoodle/backend-v1.4.8) (2024-10-01)


### Bug Fixes

* do some shit ([cfe0e9f](https://github.com/remoodle/heresy/commit/cfe0e9fc14f28a5fe65b75f386f86360af6d7f4d))

## [1.4.7](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.6...remoodle/backend-v1.4.7) (2024-10-01)


### Bug Fixes

* some basic stuff ([2db3427](https://github.com/remoodle/heresy/commit/2db34273ab7a11c14ed2b7e2a3aec5caa4bfe3d4))

## [1.4.6](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.5...remoodle/backend-v1.4.6) (2024-09-30)


### Bug Fixes

* strict limit rules ([6d24da3](https://github.com/remoodle/heresy/commit/6d24da3d6f51c6b38a9bbe32a9b1b36d5e76d8fd))

## [1.4.5](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.4...remoodle/backend-v1.4.5) (2024-09-30)


### Bug Fixes

* update rate limiter ([acbef1c](https://github.com/remoodle/heresy/commit/acbef1cf9bf35664b0d721ba65d6effc1c4a5976))

## [1.4.4](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.3...remoodle/backend-v1.4.4) (2024-09-30)


### Bug Fixes

* add hono rate limiter ([e83c538](https://github.com/remoodle/heresy/commit/e83c538c546b91287848e6fd78124f008a757153))

## [1.4.3](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.2...remoodle/backend-v1.4.3) (2024-09-28)


### Bug Fixes

* dockerfile ([85d7e59](https://github.com/remoodle/heresy/commit/85d7e590231ce817df8a51f46eae7e05d275a089))
* separate entrypoints ([7e9bf85](https://github.com/remoodle/heresy/commit/7e9bf85f205d597984df23c782a48bbe302a4c82))
* update Dockerfile ([45e43dd](https://github.com/remoodle/heresy/commit/45e43dd015cc2a8d60d756285f70a6cce79ceaa9))


### Miscellaneous Chores

* sever =&gt; api ([34dcc04](https://github.com/remoodle/heresy/commit/34dcc049d407f88dd29752c98e3b14085db7c032))
* update Dockerfile ([402e79e](https://github.com/remoodle/heresy/commit/402e79e234d7a094adb2a5c2e2091fdbe18b020b))

## [1.4.2](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.1...remoodle/backend-v1.4.2) (2024-09-28)


### Bug Fixes

* concise errors ([3c74d61](https://github.com/remoodle/heresy/commit/3c74d61fac4a098f9a248d8bfed44329775ac9a0))

## [1.4.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.4.0...remoodle/backend-v1.4.1) (2024-09-28)


### Miscellaneous Chores

* remove webhook log ([ef31796](https://github.com/remoodle/heresy/commit/ef31796c87144e93ab8f429064d0ff43574cd3e3))

## [1.4.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.3.1...remoodle/backend-v1.4.0) (2024-09-27)


### Features

* add pino logger ([753f31f](https://github.com/remoodle/heresy/commit/753f31faa8abe60ad26759a3bac8121a4253e231))
* bullmq dashboard ([7caead0](https://github.com/remoodle/heresy/commit/7caead0862ce8ccbe875fd1e74d39dd05757703d))
* remove grades crawler, add webhook, adapt smihs and config ([5d5aed5](https://github.com/remoodle/heresy/commit/5d5aed55354fc03d8fbaeababe8e80979a1e074a))


### Bug Fixes

* add 2 retries with exponential backoff ([a14ae89](https://github.com/remoodle/heresy/commit/a14ae89923758e7945e1a02a4791b0daf51a2dbc))
* add skipped return value and error handling ([ca9c4b2](https://github.com/remoodle/heresy/commit/ca9c4b296db462052ae172bda8b48ac210dad30a))
* change bull board base path ([1e9ef49](https://github.com/remoodle/heresy/commit/1e9ef4917127014527970cf8cd42e49c664c01f9))
* change scheduler queue name ([feec90d](https://github.com/remoodle/heresy/commit/feec90d33bd8344d618dd11f3f535cfeb433db16))
* disable logger for crawler ([ff6bca8](https://github.com/remoodle/heresy/commit/ff6bca8c8bb876d24d0c73af34fc9429ae51ab65))
* enhance logs ([4916c2f](https://github.com/remoodle/heresy/commit/4916c2f2f87ff5fccdea7f664241797d6dadac51))
* get rid of job.remove ([dc65016](https://github.com/remoodle/heresy/commit/dc650162ce24296f5e3708f158c739391be79d85))
* pass options correctly ([69af8b2](https://github.com/remoodle/heresy/commit/69af8b29b57c482e14ef9d9b77fa639a69615829))
* simplify return values ([d249aa7](https://github.com/remoodle/heresy/commit/d249aa7fcb5c523aa1ccf50dec52ba9b54b940ff))


### Miscellaneous Chores

* add queue error handlers ([0adaee4](https://github.com/remoodle/heresy/commit/0adaee4f762cecd4d75bc38f97eed73085920c97))
* add temp log ([917d062](https://github.com/remoodle/heresy/commit/917d062af22a5ad3c5bf534e4d68cc945a40b5d4))
* rename notifier server entry ([809c383](https://github.com/remoodle/heresy/commit/809c383e780959157011469b34b0daab16a2feb8))


### Code Refactoring

* introduce proper sheduler ([be15728](https://github.com/remoodle/heresy/commit/be15728cd46770182efb4361d47482e09c860101))

## [1.3.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.3.0...remoodle/backend-v1.3.1) (2024-09-24)


### Bug Fixes

* mark group deadline reminders as notified ([1066f76](https://github.com/remoodle/heresy/commit/1066f76cf0d6816e510b63f710eae9922a80e68f))


### Reverts

* use old deadline reminders version ([4f12c10](https://github.com/remoodle/heresy/commit/4f12c10bd8c7de751961316bb11d66d906e9b7dc))

## [1.3.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.19...remoodle/backend-v1.3.0) (2024-09-24)


### Features

* services split ([ab2fada](https://github.com/remoodle/heresy/commit/ab2fadaa19d028c80e5e04cacdcb8dc79f70353d))


### Bug Fixes

* add service logging ([3f13e29](https://github.com/remoodle/heresy/commit/3f13e29ec8b0f3e19325959eb59722a45c270557))
* change route name ([88fdfa8](https://github.com/remoodle/heresy/commit/88fdfa85e9e061aba1b40b3c605d7cac5da72674))

## [1.2.19](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.18...remoodle/backend-v1.2.19) (2024-09-23)


### Bug Fixes

* trigger ci ([4a901fe](https://github.com/remoodle/heresy/commit/4a901fe63ca0f08411c1c84067a8adfa1932f04c))

## [1.2.18](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.17...remoodle/backend-v1.2.18) (2024-09-23)


### Miscellaneous Chores

* nun compare-versions ([587c6b0](https://github.com/remoodle/heresy/commit/587c6b0bee588297f89e94be5982fcf6f927cec8))


### Code Refactoring

* change queue names ([8911172](https://github.com/remoodle/heresy/commit/8911172c4cd2c58aa3488a6ab24f1e837fc0fa8b))
* use bullmq repeatable instead of cron tasks ([8773de7](https://github.com/remoodle/heresy/commit/8773de7623f44b1bbfb6d5d91dcb0f5c6f7dd270))

## [1.2.17](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.16...remoodle/backend-v1.2.17) (2024-09-22)


### Bug Fixes

* backend fixes ([bdc8614](https://github.com/remoodle/heresy/commit/bdc8614b9255a5563f6e92c6457779cdd0e62c3a))

## [1.2.16](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.15...remoodle/backend-v1.2.16) (2024-09-21)


### Bug Fixes

* disable semver check ([ac60bcb](https://github.com/remoodle/heresy/commit/ac60bcbd5de2f4a09e2eea5c3b6771c6b23beaf4))

## [1.2.15](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.14...remoodle/backend-v1.2.15) (2024-09-19)


### Bug Fixes

* **backend:** add deadlines sorting ([006c59a](https://github.com/remoodle/heresy/commit/006c59ad20f4f046f93def01d36896d509f8afbf))
* omit extra step ([ad4f411](https://github.com/remoodle/heresy/commit/ad4f411eabd2db1d1e5d889d44dae77db67444cb))

## [1.2.14](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.13...remoodle/backend-v1.2.14) (2024-09-18)


### Bug Fixes

* change telegram formatting ([1cbdfc9](https://github.com/remoodle/heresy/commit/1cbdfc9dc843c5a6fd985455a3089632f3a8d916))

## [1.2.13](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.12...remoodle/backend-v1.2.13) (2024-09-15)


### Continuous Integration

* test ([c7d657c](https://github.com/remoodle/heresy/commit/c7d657cdd7033c3d4ab79ac920887ef55c9f6e16))

## [1.2.12](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.11...remoodle/backend-v1.2.12) (2024-09-15)


### Bug Fixes

* shit ([309bb7c](https://github.com/remoodle/heresy/commit/309bb7c3acce3ea49c508d75adbba207e6cc76e7))

## [1.2.11](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.10...remoodle/backend-v1.2.11) (2024-09-15)


### Bug Fixes

* ci ([ecf2239](https://github.com/remoodle/heresy/commit/ecf22399605342895522e72ee91cc9a6cfe19906))

## [1.2.10](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.9...remoodle/backend-v1.2.10) (2024-09-15)


### Bug Fixes

* trigger ci ([ee1a8f0](https://github.com/remoodle/heresy/commit/ee1a8f018d020d9d1a8d2e70dad9446536e7e976))

## [1.2.9](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.8...remoodle/backend-v1.2.9) (2024-09-15)


### Bug Fixes

* trigger ci ([3115b06](https://github.com/remoodle/heresy/commit/3115b0616a85ae8d49487f8b01ae916f3be922f7))

## [1.2.8](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.7...remoodle/backend-v1.2.8) (2024-09-14)


### Bug Fixes

* eliminate crawler collisions ([a36e66a](https://github.com/remoodle/heresy/commit/a36e66a8e178970e1c74c3a71c94fd84b68aab3a))
* proper formatting ([6e36625](https://github.com/remoodle/heresy/commit/6e3662594ce7c5d032eba43a89a0bb20d50d6df6))

## [1.2.7](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.6...remoodle/backend-v1.2.7) (2024-09-13)


### Bug Fixes

* formatter's timezone ([1e432d7](https://github.com/remoodle/heresy/commit/1e432d7d256005474f6e5eeb4d67421255ffbab2))
* **notifications:** highlight and use · instead of - ([e34b52f](https://github.com/remoodle/heresy/commit/e34b52f36674d1ec7ee2482994634fde4f24eaed))
* notifier tests ([9274c65](https://github.com/remoodle/heresy/commit/9274c65025b5073b8db10ef9a7763e5786260df9))
* return missing log ([ea75dcc](https://github.com/remoodle/heresy/commit/ea75dccd0bd8188f092100694dc9d14910d7d304))

## [1.2.6](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.5...remoodle/backend-v1.2.6) (2024-09-13)


### Bug Fixes

* fine tune crawler ([d6f60d2](https://github.com/remoodle/heresy/commit/d6f60d261ea804d0fc5dd5b5679a36e8e77b7fcd))

## [1.2.5](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.4...remoodle/backend-v1.2.5) (2024-09-13)


### Bug Fixes

* better logs ([c42baa3](https://github.com/remoodle/heresy/commit/c42baa30f6dc44bf32d1146d988b38f2d11779c9))

## [1.2.4](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.3...remoodle/backend-v1.2.4) (2024-09-12)


### Bug Fixes

* handle uncaughtException and unhandledRejection ([acc75cc](https://github.com/remoodle/heresy/commit/acc75ccb2e6032b58eca5d11f5f46e2d143ba37f))
* readable logs ([d1ece43](https://github.com/remoodle/heresy/commit/d1ece43daf98ec2f5d8246ae374128bb447b991c))

## [1.2.3](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.2...remoodle/backend-v1.2.3) (2024-09-12)


### Bug Fixes

* configurable crawler cron ([02db3b6](https://github.com/remoodle/heresy/commit/02db3b666ce712bf01d274f6912092ac8a1a0962))

## [1.2.2](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.1...remoodle/backend-v1.2.2) (2024-09-12)


### Bug Fixes

* dont break shit in production ([da97844](https://github.com/remoodle/heresy/commit/da97844ebb43290fa06d4de8e3a135f5f84bccb3))

## [1.2.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.2.0...remoodle/backend-v1.2.1) (2024-09-12)


### Bug Fixes

* bump lcv ([4c6c311](https://github.com/remoodle/heresy/commit/4c6c311caee8afa5d295e5dbec03b99debdc7db7))

## [1.2.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.7...remoodle/backend-v1.2.0) (2024-09-12)


### Features

* noOnline support in crawler ([256826e](https://github.com/remoodle/heresy/commit/256826ee583f0a5d9cec2e5612752e6eb2d100d7))
* reminder thresholds settings ([a34b8a6](https://github.com/remoodle/heresy/commit/a34b8a6f261ca1cc9a6119a7f03b2c33d0424a79))


### Bug Fixes

* **api:** add thresholds limit ([8c32b69](https://github.com/remoodle/heresy/commit/8c32b69bc362b49237cc5694c06d286ecad89f5b))
* better formatting ([d48096d](https://github.com/remoodle/heresy/commit/d48096ddf696716e4ce2529d93291780ab3fabfd))
* lower thresholds ([d9a004c](https://github.com/remoodle/heresy/commit/d9a004c970d46ffac0b528d109453fde854beaa2))
* notifier ([507a107](https://github.com/remoodle/heresy/commit/507a107577437237076ead11218e613fdb8d432f))
* versioning ([25779fa](https://github.com/remoodle/heresy/commit/25779faca0a5a3829b6b6e4a21d3eba0b2132e59))


### Miscellaneous Chores

* remove shit ([0124e28](https://github.com/remoodle/heresy/commit/0124e28b003b938069e1e26ff49601bbcaa784b7))


### Code Refactoring

* move hc to lib ([74eb9df](https://github.com/remoodle/heresy/commit/74eb9dfd1fe284bd09d3c55dfe68ff649fe25b22))
* **notifier:** move files around ([c8d3869](https://github.com/remoodle/heresy/commit/c8d3869b14e9ed5b300474a81a8af156cc5cd79d))

## [1.1.7](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.6...remoodle/backend-v1.1.7) (2024-09-09)


### Bug Fixes

* trigger back ([538c4bc](https://github.com/remoodle/heresy/commit/538c4bcbf5e693d0f3d7c8d806c8e498aa6e99a0))

## [1.1.6](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.5...remoodle/backend-v1.1.6) (2024-09-09)


### Bug Fixes

* graceful shutdown ([037f7c3](https://github.com/remoodle/heresy/commit/037f7c3da24260332753c306107752243b01bb40))
* remove on complete and fail ([8e99384](https://github.com/remoodle/heresy/commit/8e9938466aa2179f45e31d81726a77928f28a738))

## [1.1.5](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.4...remoodle/backend-v1.1.5) (2024-09-09)


### Code Refactoring

* introduce bullmq ([8c501ec](https://github.com/remoodle/heresy/commit/8c501ec6781322c7f65e1220707a07e8e715401b))

## [1.1.4](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.3...remoodle/backend-v1.1.4) (2024-09-08)


### Miscellaneous Chores

* remove console.log s ([f0329ff](https://github.com/remoodle/heresy/commit/f0329ffc47da206d625212997a1aab265a60a9d3))

## [1.1.3](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.2...remoodle/backend-v1.1.3) (2024-09-08)


### Bug Fixes

* check compatible version on prod only ([dd84e05](https://github.com/remoodle/heresy/commit/dd84e05bc8878069b5c615b03c835788f7c56b57))

## [1.1.2](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.1...remoodle/backend-v1.1.2) (2024-09-08)


### Bug Fixes

* **notifier:** exclude empty names ([51b4c92](https://github.com/remoodle/heresy/commit/51b4c92e08a784f29cab7448959b66e02de3fe35))
* refactor alerts ([763a6d3](https://github.com/remoodle/heresy/commit/763a6d3acb0a660ccecb4333e8edc9694589da2d))


### Code Refactoring

* loosy tests ([3660b70](https://github.com/remoodle/heresy/commit/3660b701fb3a968c9bb1c35ca2876b5c655babc5))

## [1.1.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.1.0...remoodle/backend-v1.1.1) (2024-09-07)


### Bug Fixes

* log shit better ([accc197](https://github.com/remoodle/heresy/commit/accc197ac79ca1a22c4bd43b52e8a68873691162))

## [1.1.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v1.0.0...remoodle/backend-v1.1.0) (2024-09-07)


### Features

* add notification settings ([d60e788](https://github.com/remoodle/heresy/commit/d60e788dbb76dec90f53bc1b1c899d4fa417be65))


### Bug Fixes

* monke moment ([f6012bd](https://github.com/remoodle/heresy/commit/f6012bdcf63e05a224237457674685a635937100))


### Code Refactoring

* clean up some shit ([63bca8f](https://github.com/remoodle/heresy/commit/63bca8fe56f6f70f147e1caf779fe159fb62368b))

## [1.0.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.8.0...remoodle/backend-v1.0.0) (2024-09-07)


### Features

* aaa ([c59ce4b](https://github.com/remoodle/heresy/commit/c59ce4b763bfdce0f23f38b9d156b0a4e7bd6101))
* add auth check route ([6d689d8](https://github.com/remoodle/heresy/commit/6d689d8eab35586295f03d70362ef8af25c9309b))
* add course status support ([ec3a00d](https://github.com/remoodle/heresy/commit/ec3a00d502e01589d4c2c9952c749f7fed16bf29))
* add deadline notification v0 ([29fc18b](https://github.com/remoodle/heresy/commit/29fc18b8cf5203f19d1a65a461644860c2787988))
* add experimental bot ([04be2a9](https://github.com/remoodle/heresy/commit/04be2a986d93da93d0b937dd48ec6a39f5db8ab5))
* **auth:** add telegram oauth ([2a4eb28](https://github.com/remoodle/heresy/commit/2a4eb28ec0743b5d72c635a54f7c69532d8bb4f3))
* integrate otp connect ([2ce8f1d](https://github.com/remoodle/heresy/commit/2ce8f1dabe85c48b0218a59f03019579ddd9206c))
* leastCompatibleVersion check ([8abeb5d](https://github.com/remoodle/heresy/commit/8abeb5d1df5f4f03b87950186ca7e8f3519a3955))
* new db package new otp ([65c9a7b](https://github.com/remoodle/heresy/commit/65c9a7b8972e49683d3eb9b2a2a7f86d09ad2787))
* qs shit ([73e2f7c](https://github.com/remoodle/heresy/commit/73e2f7ca4b9092d66223d95d63319a26a3872f41))
* trigger release ([60c42f8](https://github.com/remoodle/heresy/commit/60c42f87dbb7a499dee49a69c2a081fb19938dff))


### Bug Fixes

* better logs ([b9318de](https://github.com/remoodle/heresy/commit/b9318de21709ba130f546af09c9ba2f9f362ddfd))
* better types ([1acfc02](https://github.com/remoodle/heresy/commit/1acfc024de2076174a50ff34116bab7723352e3f))
* build command ([a997d04](https://github.com/remoodle/heresy/commit/a997d04377032b351b7176cce190f1b1c7083f62))
* bundle shit properply ([c3ce9a2](https://github.com/remoodle/heresy/commit/c3ce9a235761c523bc07bec77b31f6ab941dfcc9))
* change format for grades notifications ([#113](https://github.com/remoodle/heresy/issues/113)) ([1fb74ee](https://github.com/remoodle/heresy/commit/1fb74ee0a672a840be1d7a270070661c2eda8d91))
* connect user on telegram register ([8d1d939](https://github.com/remoodle/heresy/commit/8d1d939ff7c89bddef9a2fc8444e46cb75f69a26))
* correct dockerfile ([f898678](https://github.com/remoodle/heresy/commit/f8986783e7322662bf8528d14f6256a8a5483741))
* delete deadlines with user ([80c3ab1](https://github.com/remoodle/heresy/commit/80c3ab12ab256094c60360937001521351f36065))
* handle errors ([e2a572a](https://github.com/remoodle/heresy/commit/e2a572a90f520629b96093c110d6f48c1415ea42))
* implicitly define type ([e02fd7d](https://github.com/remoodle/heresy/commit/e02fd7d13ebd4ec1f0368525bca55216dd4d068f))
* no verbose api logs ([9c42733](https://github.com/remoodle/heresy/commit/9c4273360017346f98102073eb99059dbfe55465))
* notifications plz work ([97f796d](https://github.com/remoodle/heresy/commit/97f796df45f3d3131c941ff3b9da4e3ee7c463ad))
* **processing:** do not include [_, null, null] diffs ([af417c1](https://github.com/remoodle/heresy/commit/af417c16baea6d48c04a44ddcbcfe7c6717bcd2e))
* proper start script ([bda199f](https://github.com/remoodle/heresy/commit/bda199f721d375055661b8b79c9e1ab8a7a94f87))
* remove courses with user ([b6647e5](https://github.com/remoodle/heresy/commit/b6647e5e58d88b60ce4fdf40dcfe05c940f6e7b5))
* remove shit ([e4c21b8](https://github.com/remoodle/heresy/commit/e4c21b8d957e327e1665b55f573b459b5d41cec3))
* rookie mistake ([05f0710](https://github.com/remoodle/heresy/commit/05f07106e25eddfbfdef6cef1567e33587a8013c))
* shit ([#72](https://github.com/remoodle/heresy/issues/72)) ([9f4f963](https://github.com/remoodle/heresy/commit/9f4f963aef6f4927999c4a4b14edfc978001adc3))
* stlying ([b4ceb73](https://github.com/remoodle/heresy/commit/b4ceb73cc5eeac399d20f983f803ba1dfcbf31db))
* test ([10e1032](https://github.com/remoodle/heresy/commit/10e10327b0b4014d33ab419c0a83008c49e2aa21))
* test ([0ce2924](https://github.com/remoodle/heresy/commit/0ce2924925112e2aa32f83d9714c36c6d89072ee))
* test ([5cac936](https://github.com/remoodle/heresy/commit/5cac936b955bd289c1e96a3a49f9d89ee0163719))
* test ([4d0a76b](https://github.com/remoodle/heresy/commit/4d0a76b747cccf7b4218b44a7f005ecd33f25855))
* test ([3ab80fe](https://github.com/remoodle/heresy/commit/3ab80fe53fc08e2987150fa322d416ae69844e1c))
* test ([45d6bdb](https://github.com/remoodle/heresy/commit/45d6bdb5464c761ba1ffa0296a69fb697578e368))
* trigger ci ([ec9fc02](https://github.com/remoodle/heresy/commit/ec9fc024749c68032947f0a023fd389eb01f6d6e))
* trigger ci ([0ad2241](https://github.com/remoodle/heresy/commit/0ad224194381ec304c4a4da3422bedebffc315d5))
* trigger deploy ([1b2920c](https://github.com/remoodle/heresy/commit/1b2920cf0ccf2cefd29124ca5cc781b9d3ce3c45))
* update scripts ([59b089c](https://github.com/remoodle/heresy/commit/59b089c33a4c7d1b30e4aed171018ae4bd5441df))
* utc time ([1b93bf0](https://github.com/remoodle/heresy/commit/1b93bf0b730fb5a00eb29d4288716a88670bf1d5))
* wait a bit ([17c56bc](https://github.com/remoodle/heresy/commit/17c56bcc52d6ac55e49d741d1d3f6f0b7992e058))


### Reverts

* shit ([e2d1ef2](https://github.com/remoodle/heresy/commit/e2d1ef26795876f98de32fb9b2c29ae845992c56))


### Documentation

* trigger ci ([a112a18](https://github.com/remoodle/heresy/commit/a112a18914d6b4882abced1c3fa24b976f4ca019))


### Miscellaneous Chores

* complete stale todos ([fa1b9db](https://github.com/remoodle/heresy/commit/fa1b9db77b5104e11f2225f489d4ab966d4730b5))
* **docker:** set UTC+5 time ([c23420d](https://github.com/remoodle/heresy/commit/c23420d4fc73433902debcd51689600c894cb607))
* oops ([08ba58c](https://github.com/remoodle/heresy/commit/08ba58c57a1cf86e100da97068ec209c8fbcb3dc))
* **remoodle/backend:** bump backend version ([2f8ab4b](https://github.com/remoodle/heresy/commit/2f8ab4b894d6c9d118469dc0816a7d5dfc9c78dd))
* remove showRoutes ([dfeb30f](https://github.com/remoodle/heresy/commit/dfeb30f0b7cc81402537a73137a98210bc5c1ec8))
* remove unused export ([34f3579](https://github.com/remoodle/heresy/commit/34f3579c8913514427ea88f1181d61fa6dbd9a97))
* repo stuff ([c991bfb](https://github.com/remoodle/heresy/commit/c991bfbcd1145a5a8fb3ecfb3fbb10e8026e773a))
* **trunk:** release remoodle/backend 0.2.0 ([#67](https://github.com/remoodle/heresy/issues/67)) ([ab8dea2](https://github.com/remoodle/heresy/commit/ab8dea22025429a6b24e1f73f29108950a84bca4))
* **trunk:** release remoodle/backend 0.2.0 ([#68](https://github.com/remoodle/heresy/issues/68)) ([2a7ad3e](https://github.com/remoodle/heresy/commit/2a7ad3e77ac361d5174adabf8bcaa5442756794a))
* **trunk:** release remoodle/backend 0.2.0 ([#70](https://github.com/remoodle/heresy/issues/70)) ([ab43ce5](https://github.com/remoodle/heresy/commit/ab43ce5d9152e21f87063af9b84eb52f9d2c6c0b))
* **trunk:** release remoodle/backend 0.2.1 ([#71](https://github.com/remoodle/heresy/issues/71)) ([0869cb5](https://github.com/remoodle/heresy/commit/0869cb5436c54d0b1ee11c8548debaa7ec10c91e))
* **trunk:** release remoodle/backend 0.2.10 ([#84](https://github.com/remoodle/heresy/issues/84)) ([2aabede](https://github.com/remoodle/heresy/commit/2aabede0b05d804b8051a6a576388fdc45683068))
* **trunk:** release remoodle/backend 0.2.11 ([#85](https://github.com/remoodle/heresy/issues/85)) ([fa18e30](https://github.com/remoodle/heresy/commit/fa18e30f4649cbd825ff3ccd059bc0c927f755bc))
* **trunk:** release remoodle/backend 0.2.12 ([#86](https://github.com/remoodle/heresy/issues/86)) ([464752d](https://github.com/remoodle/heresy/commit/464752d3749e7e2452a6b6be8405db8355e5f1e0))
* **trunk:** release remoodle/backend 0.2.13 ([#87](https://github.com/remoodle/heresy/issues/87)) ([99a9ec1](https://github.com/remoodle/heresy/commit/99a9ec14889741699fd905064e2ebcbcbab3a527))
* **trunk:** release remoodle/backend 0.2.14 ([#88](https://github.com/remoodle/heresy/issues/88)) ([c758244](https://github.com/remoodle/heresy/commit/c7582445c89d3124b953cb0e08787ac960d67349))
* **trunk:** release remoodle/backend 0.2.2 ([#73](https://github.com/remoodle/heresy/issues/73)) ([6a8ddf8](https://github.com/remoodle/heresy/commit/6a8ddf8a24c7e26346f880512e21eaac01e4f349))
* **trunk:** release remoodle/backend 0.2.3 ([#74](https://github.com/remoodle/heresy/issues/74)) ([7964a5b](https://github.com/remoodle/heresy/commit/7964a5b1b812174cb180969731e885d5330c4172))
* **trunk:** release remoodle/backend 0.2.4 ([#75](https://github.com/remoodle/heresy/issues/75)) ([4495a7a](https://github.com/remoodle/heresy/commit/4495a7aafcbdfc8676c143d20c22967b060c6881))
* **trunk:** release remoodle/backend 0.2.5 ([#76](https://github.com/remoodle/heresy/issues/76)) ([9981450](https://github.com/remoodle/heresy/commit/99814506d36c3a85dadd3d1f3c2494230ee18ba5))
* **trunk:** release remoodle/backend 0.2.6 ([#79](https://github.com/remoodle/heresy/issues/79)) ([0234763](https://github.com/remoodle/heresy/commit/02347639903248c3e76f0bcadd0fc1feac13cd1d))
* **trunk:** release remoodle/backend 0.2.7 ([#80](https://github.com/remoodle/heresy/issues/80)) ([c250d55](https://github.com/remoodle/heresy/commit/c250d55e1f25dff6799c42ec93a30b7dab11c8e3))
* **trunk:** release remoodle/backend 0.2.8 ([#82](https://github.com/remoodle/heresy/issues/82)) ([41da907](https://github.com/remoodle/heresy/commit/41da907f95236962b53d539ca9639467da47525e))
* **trunk:** release remoodle/backend 0.2.9 ([#83](https://github.com/remoodle/heresy/issues/83)) ([071d124](https://github.com/remoodle/heresy/commit/071d124ae41ee142b6f4c18c91860862454de238))
* **trunk:** release remoodle/backend 0.3.0 ([#91](https://github.com/remoodle/heresy/issues/91)) ([a16b2ca](https://github.com/remoodle/heresy/commit/a16b2cad3ec875aa3052123ef18f667fc3775a5b))
* **trunk:** release remoodle/backend 0.3.1 ([#92](https://github.com/remoodle/heresy/issues/92)) ([3d33bc2](https://github.com/remoodle/heresy/commit/3d33bc238df16b36e1677458f2b90ed0d1fc79c6))
* **trunk:** release remoodle/backend 0.4.0 ([#93](https://github.com/remoodle/heresy/issues/93)) ([fec6309](https://github.com/remoodle/heresy/commit/fec6309b4f27d611c1eb691a98eae659e3d54e12))
* **trunk:** release remoodle/backend 0.5.0 ([#96](https://github.com/remoodle/heresy/issues/96)) ([59a57c7](https://github.com/remoodle/heresy/commit/59a57c7c00dbdf0d189ea6601ae5963e7b826568))
* **trunk:** release remoodle/backend 0.6.0 ([#98](https://github.com/remoodle/heresy/issues/98)) ([7e71a71](https://github.com/remoodle/heresy/commit/7e71a7147fd65f218b7bacfb6a2104149afefc93))
* **trunk:** release remoodle/backend 0.6.1 ([#99](https://github.com/remoodle/heresy/issues/99)) ([8e183f4](https://github.com/remoodle/heresy/commit/8e183f49918e76b64a2a761393026e8aca676c8d))
* **trunk:** release remoodle/backend 0.6.2 ([#101](https://github.com/remoodle/heresy/issues/101)) ([fc1117b](https://github.com/remoodle/heresy/commit/fc1117bd95e8efa0f2880658514e878ebbcd0a13))
* **trunk:** release remoodle/backend 0.6.3 ([#104](https://github.com/remoodle/heresy/issues/104)) ([82e151a](https://github.com/remoodle/heresy/commit/82e151a9dd09109b760b7f32b99d757ee8f37e3a))
* **trunk:** release remoodle/backend 0.6.4 ([#105](https://github.com/remoodle/heresy/issues/105)) ([0ffacc1](https://github.com/remoodle/heresy/commit/0ffacc13fbdcfe3ad6d1ed5e645fc24c80d922df))
* **trunk:** release remoodle/backend 0.6.5 ([#108](https://github.com/remoodle/heresy/issues/108)) ([07bcf94](https://github.com/remoodle/heresy/commit/07bcf94eb77dfb0b43c0818a789ff497e1910ac2))
* **trunk:** release remoodle/backend 0.7.0 ([#109](https://github.com/remoodle/heresy/issues/109)) ([be4def7](https://github.com/remoodle/heresy/commit/be4def75362a3af8bc9cc232e6aa56a34684fe8e))
* **trunk:** release remoodle/backend 0.7.1 ([#110](https://github.com/remoodle/heresy/issues/110)) ([58031c2](https://github.com/remoodle/heresy/commit/58031c2d4e79cb2db5e77cc39b2ddf8dd559639d))
* **trunk:** release remoodle/backend 0.7.2 ([#112](https://github.com/remoodle/heresy/issues/112)) ([e395d39](https://github.com/remoodle/heresy/commit/e395d3962ff7c2dab353e1a5f1ada2f5a2c09986))
* **trunk:** release remoodle/backend 0.7.3 ([#116](https://github.com/remoodle/heresy/issues/116)) ([3d4accf](https://github.com/remoodle/heresy/commit/3d4accf49c86c27f5d726c942ba447acd388ec0e))
* **trunk:** release remoodle/backend 0.7.4 ([#118](https://github.com/remoodle/heresy/issues/118)) ([a62d04a](https://github.com/remoodle/heresy/commit/a62d04ac23f6acf9fd6c4ba5e27afe634ea70722))
* **trunk:** release remoodle/backend 0.7.5 ([#119](https://github.com/remoodle/heresy/issues/119)) ([54c60cb](https://github.com/remoodle/heresy/commit/54c60cb21c49e231c6b6c5b7d0765057a28db2ed))
* **trunk:** release remoodle/backend 0.8.0 ([#121](https://github.com/remoodle/heresy/issues/121)) ([38a3f00](https://github.com/remoodle/heresy/commit/38a3f00b34559e9643b35e95d866dee054eddb49))
* use VERSION_TAG in docker ([f2e81af](https://github.com/remoodle/heresy/commit/f2e81af6391433c42fb438f83c7969c3151efb29))


### Code Refactoring

* **backend,tg_bot:** refactor headers add change config ([1cf40ff](https://github.com/remoodle/heresy/commit/1cf40ff138087afc2730c8a40eb108c8e5f8e05f))
* common rpc client ([db9eb3e](https://github.com/remoodle/heresy/commit/db9eb3e7b1f5ba023e066d2203be659620bc41be))
* create hc-wrapper ([f699e6b](https://github.com/remoodle/heresy/commit/f699e6b5791b391fb95d507962bd0b0aa266af1c))
* get rid of total shit ([698932e](https://github.com/remoodle/heresy/commit/698932e3b182ce9894de22928f262b6535e9323d))
* move some stuff to utils ([0a7d590](https://github.com/remoodle/heresy/commit/0a7d590bc5e24bc9a6136b76092fc0346ac68559))
* **notifier:** remove unnecessary nesting and complexity ([aab271b](https://github.com/remoodle/heresy/commit/aab271b46a4f712add5e1d611e63c5222a09cc43))
* shit ([89ebe97](https://github.com/remoodle/heresy/commit/89ebe97ea1dd4747ee2c76c66a2cf4b55d091ed1))
* simplify tsup config ([f7013c1](https://github.com/remoodle/heresy/commit/f7013c15c118290cb4bd0c11643ff35f01756334))


### Build System

* **backend:** update pnpm ([acc60cc](https://github.com/remoodle/heresy/commit/acc60cc937be0f81b77a0f0aa54dc8f74decc77d))
* optimize builds ([f7013c1](https://github.com/remoodle/heresy/commit/f7013c15c118290cb4bd0c11643ff35f01756334))


### Continuous Integration

* add ci ([c3b316b](https://github.com/remoodle/heresy/commit/c3b316b9e08f514ecab6a14956e6b4153dfd6de9))
* trigger ([501dde6](https://github.com/remoodle/heresy/commit/501dde621e742e3b49834f170029ffb84bf60bc2))
* trigger ([5934d73](https://github.com/remoodle/heresy/commit/5934d73b0c694a52f466857f5221b417908d2f37))
* trigger ([440e80e](https://github.com/remoodle/heresy/commit/440e80e4f20b0792af457a576c8d7babcdb37657))
* trigger ci ([486a8c6](https://github.com/remoodle/heresy/commit/486a8c66cc0213601de181e1189b9e26d2690cc2))

## [0.8.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.7.5...remoodle/backend-v0.8.0) (2024-09-07)


### Features

* add course status support ([735e4db](https://github.com/remoodle/heresy/commit/735e4db27a40b7adf9ee2093af6da83c3ee810d2))
* leastCompatibleVersion check ([bea80c6](https://github.com/remoodle/heresy/commit/bea80c6731532d3e1b0a8db57804788096a298c7))


### Bug Fixes

* better types ([1acfc02](https://github.com/remoodle/heresy/commit/1acfc024de2076174a50ff34116bab7723352e3f))
* **processing:** do not include [_, null, null] diffs ([af417c1](https://github.com/remoodle/heresy/commit/af417c16baea6d48c04a44ddcbcfe7c6717bcd2e))

## [0.7.5](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.7.4...remoodle/backend-v0.7.5) (2024-09-06)


### Bug Fixes

* wait a bit ([17c56bc](https://github.com/remoodle/heresy/commit/17c56bcc52d6ac55e49d741d1d3f6f0b7992e058))

## [0.7.4](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.7.3...remoodle/backend-v0.7.4) (2024-09-06)


### Bug Fixes

* rookie mistake ([05f0710](https://github.com/remoodle/heresy/commit/05f07106e25eddfbfdef6cef1567e33587a8013c))

## [0.7.3](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.7.2...remoodle/backend-v0.7.3) (2024-09-06)


### Miscellaneous Chores

* **docker:** set UTC+5 time ([c23420d](https://github.com/remoodle/heresy/commit/c23420d4fc73433902debcd51689600c894cb607))
* use VERSION_TAG in docker ([f2e81af](https://github.com/remoodle/heresy/commit/f2e81af6391433c42fb438f83c7969c3151efb29))


### Code Refactoring

* move some stuff to utils ([0a7d590](https://github.com/remoodle/heresy/commit/0a7d590bc5e24bc9a6136b76092fc0346ac68559))

## [0.7.2](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.7.1...remoodle/backend-v0.7.2) (2024-09-06)


### Bug Fixes

* change format for grades notifications ([#113](https://github.com/remoodle/heresy/issues/113)) ([1fb74ee](https://github.com/remoodle/heresy/commit/1fb74ee0a672a840be1d7a270070661c2eda8d91))
* delete deadlines with user ([80c3ab1](https://github.com/remoodle/heresy/commit/80c3ab12ab256094c60360937001521351f36065))

## [0.7.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.7.0...remoodle/backend-v0.7.1) (2024-09-06)


### Bug Fixes

* connect user on telegram register ([8d1d939](https://github.com/remoodle/heresy/commit/8d1d939ff7c89bddef9a2fc8444e46cb75f69a26))


### Miscellaneous Chores

* remove showRoutes ([dfeb30f](https://github.com/remoodle/heresy/commit/dfeb30f0b7cc81402537a73137a98210bc5c1ec8))

## [0.7.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.6.5...remoodle/backend-v0.7.0) (2024-09-06)


### Features

* add deadline notification v0 ([29fc18b](https://github.com/remoodle/heresy/commit/29fc18b8cf5203f19d1a65a461644860c2787988))


### Bug Fixes

* better logs ([b9318de](https://github.com/remoodle/heresy/commit/b9318de21709ba130f546af09c9ba2f9f362ddfd))
* no verbose api logs ([9c42733](https://github.com/remoodle/heresy/commit/9c4273360017346f98102073eb99059dbfe55465))
* utc time ([1b93bf0](https://github.com/remoodle/heresy/commit/1b93bf0b730fb5a00eb29d4288716a88670bf1d5))


### Code Refactoring

* **notifier:** remove unnecessary nesting and complexity ([aab271b](https://github.com/remoodle/heresy/commit/aab271b46a4f712add5e1d611e63c5222a09cc43))

## [0.6.5](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.6.4...remoodle/backend-v0.6.5) (2024-09-06)


### Bug Fixes

* notifications plz work ([97f796d](https://github.com/remoodle/heresy/commit/97f796df45f3d3131c941ff3b9da4e3ee7c463ad))
* remove shit ([e4c21b8](https://github.com/remoodle/heresy/commit/e4c21b8d957e327e1665b55f573b459b5d41cec3))


### Miscellaneous Chores

* complete stale todos ([fa1b9db](https://github.com/remoodle/heresy/commit/fa1b9db77b5104e11f2225f489d4ab966d4730b5))

## [0.6.4](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.6.3...remoodle/backend-v0.6.4) (2024-09-04)


### Code Refactoring

* get rid of total shit ([698932e](https://github.com/remoodle/heresy/commit/698932e3b182ce9894de22928f262b6535e9323d))

## [0.6.3](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.6.2...remoodle/backend-v0.6.3) (2024-09-03)


### Bug Fixes

* handle errors ([e2a572a](https://github.com/remoodle/heresy/commit/e2a572a90f520629b96093c110d6f48c1415ea42))

## [0.6.2](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.6.1...remoodle/backend-v0.6.2) (2024-09-03)


### Bug Fixes

* update scripts ([59b089c](https://github.com/remoodle/heresy/commit/59b089c33a4c7d1b30e4aed171018ae4bd5441df))

## [0.6.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.6.0...remoodle/backend-v0.6.1) (2024-09-03)


### Bug Fixes

* implicitly define type ([e02fd7d](https://github.com/remoodle/heresy/commit/e02fd7d13ebd4ec1f0368525bca55216dd4d068f))

## [0.6.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.5.0...remoodle/backend-v0.6.0) (2024-08-31)


### Features

* new db package new otp ([65c9a7b](https://github.com/remoodle/heresy/commit/65c9a7b8972e49683d3eb9b2a2a7f86d09ad2787))


### Miscellaneous Chores

* oops ([08ba58c](https://github.com/remoodle/heresy/commit/08ba58c57a1cf86e100da97068ec209c8fbcb3dc))
* repo stuff ([c991bfb](https://github.com/remoodle/heresy/commit/c991bfbcd1145a5a8fb3ecfb3fbb10e8026e773a))


### Code Refactoring

* shit ([89ebe97](https://github.com/remoodle/heresy/commit/89ebe97ea1dd4747ee2c76c66a2cf4b55d091ed1))

## [0.5.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.4.0...remoodle/backend-v0.5.0) (2024-08-31)


### Features

* **auth:** add telegram oauth ([2a4eb28](https://github.com/remoodle/heresy/commit/2a4eb28ec0743b5d72c635a54f7c69532d8bb4f3))

## [0.4.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.3.1...remoodle/backend-v0.4.0) (2024-08-27)


### Features

* add auth check route ([6d689d8](https://github.com/remoodle/heresy/commit/6d689d8eab35586295f03d70362ef8af25c9309b))


### Bug Fixes

* stlying ([b4ceb73](https://github.com/remoodle/heresy/commit/b4ceb73cc5eeac399d20f983f803ba1dfcbf31db))

## [0.3.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.3.0...remoodle/backend-v0.3.1) (2024-08-27)


### Bug Fixes

* bundle shit properply ([c3ce9a2](https://github.com/remoodle/heresy/commit/c3ce9a235761c523bc07bec77b31f6ab941dfcc9))

## [0.3.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.14...remoodle/backend-v0.3.0) (2024-08-27)


### Features

* trigger release ([60c42f8](https://github.com/remoodle/heresy/commit/60c42f87dbb7a499dee49a69c2a081fb19938dff))

## [0.2.14](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.13...remoodle/backend-v0.2.14) (2024-08-25)


### Code Refactoring

* **backend,tg_bot:** refactor headers add change config ([1cf40ff](https://github.com/remoodle/heresy/commit/1cf40ff138087afc2730c8a40eb108c8e5f8e05f))

## [0.2.13](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.12...remoodle/backend-v0.2.13) (2024-08-25)


### Reverts

* shit ([e2d1ef2](https://github.com/remoodle/heresy/commit/e2d1ef26795876f98de32fb9b2c29ae845992c56))

## [0.2.12](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.11...remoodle/backend-v0.2.12) (2024-08-25)


### Continuous Integration

* trigger ([501dde6](https://github.com/remoodle/heresy/commit/501dde621e742e3b49834f170029ffb84bf60bc2))

## [0.2.11](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.10...remoodle/backend-v0.2.11) (2024-08-25)


### Bug Fixes

* build command ([a997d04](https://github.com/remoodle/heresy/commit/a997d04377032b351b7176cce190f1b1c7083f62))

## [0.2.10](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.9...remoodle/backend-v0.2.10) (2024-08-25)


### Bug Fixes

* correct dockerfile ([f898678](https://github.com/remoodle/heresy/commit/f8986783e7322662bf8528d14f6256a8a5483741))

## [0.2.9](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.8...remoodle/backend-v0.2.9) (2024-08-25)


### Bug Fixes

* proper start script ([bda199f](https://github.com/remoodle/heresy/commit/bda199f721d375055661b8b79c9e1ab8a7a94f87))

## [0.2.8](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.7...remoodle/backend-v0.2.8) (2024-08-25)


### Features

* add experimental bot ([04be2a9](https://github.com/remoodle/heresy/commit/04be2a986d93da93d0b937dd48ec6a39f5db8ab5))
* integrate otp connect ([2ce8f1d](https://github.com/remoodle/heresy/commit/2ce8f1dabe85c48b0218a59f03019579ddd9206c))


### Bug Fixes

* remove courses with user ([b6647e5](https://github.com/remoodle/heresy/commit/b6647e5e58d88b60ce4fdf40dcfe05c940f6e7b5))
* shit ([#72](https://github.com/remoodle/heresy/issues/72)) ([9f4f963](https://github.com/remoodle/heresy/commit/9f4f963aef6f4927999c4a4b14edfc978001adc3))
* test ([10e1032](https://github.com/remoodle/heresy/commit/10e10327b0b4014d33ab419c0a83008c49e2aa21))
* test ([0ce2924](https://github.com/remoodle/heresy/commit/0ce2924925112e2aa32f83d9714c36c6d89072ee))
* test ([5cac936](https://github.com/remoodle/heresy/commit/5cac936b955bd289c1e96a3a49f9d89ee0163719))
* test ([4d0a76b](https://github.com/remoodle/heresy/commit/4d0a76b747cccf7b4218b44a7f005ecd33f25855))
* test ([3ab80fe](https://github.com/remoodle/heresy/commit/3ab80fe53fc08e2987150fa322d416ae69844e1c))
* test ([45d6bdb](https://github.com/remoodle/heresy/commit/45d6bdb5464c761ba1ffa0296a69fb697578e368))
* trigger ci ([ec9fc02](https://github.com/remoodle/heresy/commit/ec9fc024749c68032947f0a023fd389eb01f6d6e))
* trigger ci ([0ad2241](https://github.com/remoodle/heresy/commit/0ad224194381ec304c4a4da3422bedebffc315d5))
* trigger deploy ([1b2920c](https://github.com/remoodle/heresy/commit/1b2920cf0ccf2cefd29124ca5cc781b9d3ce3c45))


### Documentation

* trigger ci ([a112a18](https://github.com/remoodle/heresy/commit/a112a18914d6b4882abced1c3fa24b976f4ca019))


### Miscellaneous Chores

* **remoodle/backend:** bump backend version ([2f8ab4b](https://github.com/remoodle/heresy/commit/2f8ab4b894d6c9d118469dc0816a7d5dfc9c78dd))
* remove unused export ([34f3579](https://github.com/remoodle/heresy/commit/34f3579c8913514427ea88f1181d61fa6dbd9a97))
* **trunk:** release remoodle/backend 0.2.0 ([#67](https://github.com/remoodle/heresy/issues/67)) ([ab8dea2](https://github.com/remoodle/heresy/commit/ab8dea22025429a6b24e1f73f29108950a84bca4))
* **trunk:** release remoodle/backend 0.2.0 ([#68](https://github.com/remoodle/heresy/issues/68)) ([2a7ad3e](https://github.com/remoodle/heresy/commit/2a7ad3e77ac361d5174adabf8bcaa5442756794a))
* **trunk:** release remoodle/backend 0.2.0 ([#70](https://github.com/remoodle/heresy/issues/70)) ([ab43ce5](https://github.com/remoodle/heresy/commit/ab43ce5d9152e21f87063af9b84eb52f9d2c6c0b))
* **trunk:** release remoodle/backend 0.2.1 ([#71](https://github.com/remoodle/heresy/issues/71)) ([0869cb5](https://github.com/remoodle/heresy/commit/0869cb5436c54d0b1ee11c8548debaa7ec10c91e))
* **trunk:** release remoodle/backend 0.2.2 ([#73](https://github.com/remoodle/heresy/issues/73)) ([6a8ddf8](https://github.com/remoodle/heresy/commit/6a8ddf8a24c7e26346f880512e21eaac01e4f349))
* **trunk:** release remoodle/backend 0.2.3 ([#74](https://github.com/remoodle/heresy/issues/74)) ([7964a5b](https://github.com/remoodle/heresy/commit/7964a5b1b812174cb180969731e885d5330c4172))
* **trunk:** release remoodle/backend 0.2.4 ([#75](https://github.com/remoodle/heresy/issues/75)) ([4495a7a](https://github.com/remoodle/heresy/commit/4495a7aafcbdfc8676c143d20c22967b060c6881))
* **trunk:** release remoodle/backend 0.2.5 ([#76](https://github.com/remoodle/heresy/issues/76)) ([9981450](https://github.com/remoodle/heresy/commit/99814506d36c3a85dadd3d1f3c2494230ee18ba5))
* **trunk:** release remoodle/backend 0.2.6 ([#79](https://github.com/remoodle/heresy/issues/79)) ([0234763](https://github.com/remoodle/heresy/commit/02347639903248c3e76f0bcadd0fc1feac13cd1d))
* **trunk:** release remoodle/backend 0.2.7 ([#80](https://github.com/remoodle/heresy/issues/80)) ([c250d55](https://github.com/remoodle/heresy/commit/c250d55e1f25dff6799c42ec93a30b7dab11c8e3))


### Code Refactoring

* common rpc client ([db9eb3e](https://github.com/remoodle/heresy/commit/db9eb3e7b1f5ba023e066d2203be659620bc41be))
* create hc-wrapper ([f699e6b](https://github.com/remoodle/heresy/commit/f699e6b5791b391fb95d507962bd0b0aa266af1c))
* simplify tsup config ([f7013c1](https://github.com/remoodle/heresy/commit/f7013c15c118290cb4bd0c11643ff35f01756334))


### Build System

* **backend:** update pnpm ([acc60cc](https://github.com/remoodle/heresy/commit/acc60cc937be0f81b77a0f0aa54dc8f74decc77d))
* optimize builds ([f7013c1](https://github.com/remoodle/heresy/commit/f7013c15c118290cb4bd0c11643ff35f01756334))


### Continuous Integration

* add ci ([c3b316b](https://github.com/remoodle/heresy/commit/c3b316b9e08f514ecab6a14956e6b4153dfd6de9))
* trigger ([5934d73](https://github.com/remoodle/heresy/commit/5934d73b0c694a52f466857f5221b417908d2f37))
* trigger ([440e80e](https://github.com/remoodle/heresy/commit/440e80e4f20b0792af457a576c8d7babcdb37657))
* trigger ci ([486a8c6](https://github.com/remoodle/heresy/commit/486a8c66cc0213601de181e1189b9e26d2690cc2))

## [0.2.7](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.6...remoodle/backend-v0.2.7) (2024-08-25)


### Code Refactoring

* simplify tsup config ([9c5b6a5](https://github.com/remoodle/heresy/commit/9c5b6a59831c8300976718997475f547f305f3d9))


### Build System

* **backend:** update pnpm ([acc60cc](https://github.com/remoodle/heresy/commit/acc60cc937be0f81b77a0f0aa54dc8f74decc77d))
* optimize builds ([5b200ea](https://github.com/remoodle/heresy/commit/5b200ea53df78fe28a3b598e180c8ad755dde0ad))

## [0.2.6](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.5...remoodle/backend-v0.2.6) (2024-08-25)


### Bug Fixes

* trigger ci ([0ad2241](https://github.com/remoodle/heresy/commit/0ad224194381ec304c4a4da3422bedebffc315d5))

## [0.2.5](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.4...remoodle/backend-v0.2.5) (2024-08-24)


### Continuous Integration

* add ci ([c3b316b](https://github.com/remoodle/heresy/commit/c3b316b9e08f514ecab6a14956e6b4153dfd6de9))

## [0.2.4](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.3...remoodle/backend-v0.2.4) (2024-08-24)


### Bug Fixes

* test ([10e1032](https://github.com/remoodle/heresy/commit/10e10327b0b4014d33ab419c0a83008c49e2aa21))

## [0.2.3](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.2...remoodle/backend-v0.2.3) (2024-08-24)


### Bug Fixes

* test ([0ce2924](https://github.com/remoodle/heresy/commit/0ce2924925112e2aa32f83d9714c36c6d89072ee))

## [0.2.2](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.1...remoodle/backend-v0.2.2) (2024-08-24)


### Bug Fixes

* shit ([#72](https://github.com/remoodle/heresy/issues/72)) ([9f4f963](https://github.com/remoodle/heresy/commit/9f4f963aef6f4927999c4a4b14edfc978001adc3))

## [0.2.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.0...remoodle/backend-v0.2.1) (2024-08-24)


### Continuous Integration

* trigger ci ([486a8c6](https://github.com/remoodle/heresy/commit/486a8c66cc0213601de181e1189b9e26d2690cc2))

## [0.2.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.1.2...remoodle/backend-v0.2.0) (2024-08-24)


### Features

* add experimental bot ([04be2a9](https://github.com/remoodle/heresy/commit/04be2a986d93da93d0b937dd48ec6a39f5db8ab5))
* integrate otp connect ([2ce8f1d](https://github.com/remoodle/heresy/commit/2ce8f1dabe85c48b0218a59f03019579ddd9206c))


### Bug Fixes

* remove courses with user ([b6647e5](https://github.com/remoodle/heresy/commit/b6647e5e58d88b60ce4fdf40dcfe05c940f6e7b5))
* test ([5cac936](https://github.com/remoodle/heresy/commit/5cac936b955bd289c1e96a3a49f9d89ee0163719))
* test ([4d0a76b](https://github.com/remoodle/heresy/commit/4d0a76b747cccf7b4218b44a7f005ecd33f25855))
* test ([3ab80fe](https://github.com/remoodle/heresy/commit/3ab80fe53fc08e2987150fa322d416ae69844e1c))
* test ([45d6bdb](https://github.com/remoodle/heresy/commit/45d6bdb5464c761ba1ffa0296a69fb697578e368))
* trigger deploy ([1b2920c](https://github.com/remoodle/heresy/commit/1b2920cf0ccf2cefd29124ca5cc781b9d3ce3c45))


### Miscellaneous Chores

* remove unused export ([34f3579](https://github.com/remoodle/heresy/commit/34f3579c8913514427ea88f1181d61fa6dbd9a97))
* **trunk:** release remoodle/backend 0.2.0 ([#67](https://github.com/remoodle/heresy/issues/67)) ([ab8dea2](https://github.com/remoodle/heresy/commit/ab8dea22025429a6b24e1f73f29108950a84bca4))
* **trunk:** release remoodle/backend 0.2.0 ([#68](https://github.com/remoodle/heresy/issues/68)) ([2a7ad3e](https://github.com/remoodle/heresy/commit/2a7ad3e77ac361d5174adabf8bcaa5442756794a))


### Code Refactoring

* common rpc client ([db9eb3e](https://github.com/remoodle/heresy/commit/db9eb3e7b1f5ba023e066d2203be659620bc41be))
* create hc-wrapper ([f699e6b](https://github.com/remoodle/heresy/commit/f699e6b5791b391fb95d507962bd0b0aa266af1c))


### Continuous Integration

* trigger ([5934d73](https://github.com/remoodle/heresy/commit/5934d73b0c694a52f466857f5221b417908d2f37))
* trigger ([440e80e](https://github.com/remoodle/heresy/commit/440e80e4f20b0792af457a576c8d7babcdb37657))

## [0.2.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.2.0...remoodle/backend-v0.2.0) (2024-08-24)


### Features

* add experimental bot ([04be2a9](https://github.com/remoodle/heresy/commit/04be2a986d93da93d0b937dd48ec6a39f5db8ab5))
* integrate otp connect ([2ce8f1d](https://github.com/remoodle/heresy/commit/2ce8f1dabe85c48b0218a59f03019579ddd9206c))


### Bug Fixes

* remove courses with user ([b6647e5](https://github.com/remoodle/heresy/commit/b6647e5e58d88b60ce4fdf40dcfe05c940f6e7b5))
* test ([45d6bdb](https://github.com/remoodle/heresy/commit/45d6bdb5464c761ba1ffa0296a69fb697578e368))
* trigger deploy ([1b2920c](https://github.com/remoodle/heresy/commit/1b2920cf0ccf2cefd29124ca5cc781b9d3ce3c45))


### Miscellaneous Chores

* **remoodle/backend:** bump backend version ([2f8ab4b](https://github.com/remoodle/heresy/commit/2f8ab4b894d6c9d118469dc0816a7d5dfc9c78dd))
* remove unused export ([34f3579](https://github.com/remoodle/heresy/commit/34f3579c8913514427ea88f1181d61fa6dbd9a97))
* **trunk:** release remoodle/backend 0.2.0 ([#67](https://github.com/remoodle/heresy/issues/67)) ([ab8dea2](https://github.com/remoodle/heresy/commit/ab8dea22025429a6b24e1f73f29108950a84bca4))


### Code Refactoring

* common rpc client ([db9eb3e](https://github.com/remoodle/heresy/commit/db9eb3e7b1f5ba023e066d2203be659620bc41be))
* create hc-wrapper ([f699e6b](https://github.com/remoodle/heresy/commit/f699e6b5791b391fb95d507962bd0b0aa266af1c))

## 0.2.0 (2024-08-24)


### Features

* add experimental bot ([04be2a9](https://github.com/remoodle/heresy/commit/04be2a986d93da93d0b937dd48ec6a39f5db8ab5))
* integrate otp connect ([2ce8f1d](https://github.com/remoodle/heresy/commit/2ce8f1dabe85c48b0218a59f03019579ddd9206c))


### Bug Fixes

* remove courses with user ([b6647e5](https://github.com/remoodle/heresy/commit/b6647e5e58d88b60ce4fdf40dcfe05c940f6e7b5))
* trigger deploy ([1b2920c](https://github.com/remoodle/heresy/commit/1b2920cf0ccf2cefd29124ca5cc781b9d3ce3c45))


### Miscellaneous Chores

* **remoodle/backend:** bump backend version ([2f8ab4b](https://github.com/remoodle/heresy/commit/2f8ab4b894d6c9d118469dc0816a7d5dfc9c78dd))
* remove unused export ([34f3579](https://github.com/remoodle/heresy/commit/34f3579c8913514427ea88f1181d61fa6dbd9a97))


### Code Refactoring

* common rpc client ([db9eb3e](https://github.com/remoodle/heresy/commit/db9eb3e7b1f5ba023e066d2203be659620bc41be))
* create hc-wrapper ([f699e6b](https://github.com/remoodle/heresy/commit/f699e6b5791b391fb95d507962bd0b0aa266af1c))

## [0.1.2](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.1.1...remoodle/backend-v0.1.2) (2024-07-23)


### Bug Fixes

* docker backend builds ([14c6044](https://github.com/remoodle/heresy/commit/14c6044e928cc529f819a880b1c150f8d19b6d28))

## [0.1.1](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.1.0...remoodle/backend-v0.1.1) (2024-07-23)


### Bug Fixes

* backend ([89e2f2f](https://github.com/remoodle/heresy/commit/89e2f2fbcb41e05b7f8c79c63e0a995fcfb62b84))


### Miscellaneous Chores

* **remoodle/backend:** bump backend version ([2f8ab4b](https://github.com/remoodle/heresy/commit/2f8ab4b894d6c9d118469dc0816a7d5dfc9c78dd))

## [0.1.0](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.0.6...remoodle/backend-v0.1.0) (2024-07-22)


### Features

* both ([#33](https://github.com/remoodle/heresy/issues/33)) ([eebfa62](https://github.com/remoodle/heresy/commit/eebfa62c799b3b931a4093dda7c4534afad867cf))


### Bug Fixes

* both ([78667ab](https://github.com/remoodle/heresy/commit/78667ab257f2adf7c7e4ec371f16c22ef2a27bc1))

## [0.0.6](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.0.5...remoodle/backend-v0.0.6) (2024-07-19)


### Bug Fixes

* shit just to trigger docker ([4e9330f](https://github.com/remoodle/heresy/commit/4e9330f2b663c92f42f467d097cb3ce25c01e6e4))


### Styles

* format shit properly ([7789249](https://github.com/remoodle/heresy/commit/7789249d4f65215837a7b6b2c05ea40629367977))


### Miscellaneous Chores

* remove dead code ([1043459](https://github.com/remoodle/heresy/commit/10434596ec501b554aa5ad5ed1361541f1a4d1b6))
* **trunk:** release  remoodle/backend 0.0.5 ([#5](https://github.com/remoodle/heresy/issues/5)) ([0c23623](https://github.com/remoodle/heresy/commit/0c23623140e3252814960243b61e917e26143e24))

## [0.0.5](https://github.com/remoodle/heresy/compare/remoodle/backend-v0.0.4...remoodle/backend-v0.0.5) (2024-07-19)


### Bug Fixes

* shit just to trigger docker ([4e9330f](https://github.com/remoodle/heresy/commit/4e9330f2b663c92f42f467d097cb3ce25c01e6e4))


### Styles

* format shit properly ([7789249](https://github.com/remoodle/heresy/commit/7789249d4f65215837a7b6b2c05ea40629367977))


### Miscellaneous Chores

* remove dead code ([1043459](https://github.com/remoodle/heresy/commit/10434596ec501b554aa5ad5ed1361541f1a4d1b6))
