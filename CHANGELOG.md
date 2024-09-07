# Changelog

## [0.3.0](https://github.com/remoodle/core/compare/v0.2.2...v0.3.0) (2024-09-07)


### Features

* extend user's courses overall response ([aed3926](https://github.com/remoodle/core/commit/aed39267714a06b15f22eb16dbad555d3ea39a69))


### Bug Fixes

* add moodleToken, remove type ([#9](https://github.com/remoodle/core/issues/9)) ([3d0ea47](https://github.com/remoodle/core/commit/3d0ea474e4ff1809c0ecf102b92e2c4330ddc4c3))
* course model constructor ([978a460](https://github.com/remoodle/core/commit/978a460c64e0626750729cdf144a1f1803b4dd02))
* remove unused dependency ([b465901](https://github.com/remoodle/core/commit/b46590179f47dffd224ca347eb71f1914e24323d))

## [0.2.2](https://github.com/remoodle/core/compare/v0.2.1...v0.2.2) (2024-08-25)


### Bug Fixes

* trigger build ([1d8f965](https://github.com/remoodle/core/commit/1d8f965034d3b31b81b0bb3164364d14b0630b04))

## [0.2.1](https://github.com/remoodle/core/compare/v0.2.0...v0.2.1) (2024-08-25)


### Bug Fixes

* trigger build ([1fa5cc8](https://github.com/remoodle/core/commit/1fa5cc84b3fa380f308c874dbebc17cfbbfd61fc))

## [0.2.0](https://github.com/remoodle/core/compare/0.1.0...v0.2.0) (2024-08-24)


### Features

* add generate moodle token from credentials ([838e792](https://github.com/remoodle/core/commit/838e792d501aa67420dab4b74d511e9c5413516d))
* add has_password ([0e0d271](https://github.com/remoodle/core/commit/0e0d2716da91c0724a7cca66449f42f9874d4eae))
* add internal secret validation ([a96f109](https://github.com/remoodle/core/commit/a96f109e854755b295dce67f0a6025b7f22f246e))
* assignment intro support ([b724739](https://github.com/remoodle/core/commit/b72473911c1938570927ab52d7077e3f7783775e))
* **assignments:** add assignments native support ([a034615](https://github.com/remoodle/core/commit/a034615213e0ec516e799e35f1174ba936a6a4e3))
* **Assignments:** add database representation ([e198a7f](https://github.com/remoodle/core/commit/e198a7f58fb465565f21dcc9cb8f66a8f85f3f7d))
* cache course content ([1bb2061](https://github.com/remoodle/core/commit/1bb2061663da299b960f1949f9e4d3a4459c28fa))
* do kal & parse assignments ([c1d2288](https://github.com/remoodle/core/commit/c1d2288ebabb8c4bb99d8a93157874ad34358fef))
* get course assignments ([2f5ec83](https://github.com/remoodle/core/commit/2f5ec83741a2b734d9c55c7f6eda947db6cb33dd))
* **Grades:** extended grade coverage ([16f9753](https://github.com/remoodle/core/commit/16f97535f44f389946c347863d4e3151ff01fe84))
* **Queues:** add queue batch support ([08da647](https://github.com/remoodle/core/commit/08da6479299f10f8961d93c9dcd4ac20158f0745))
* remove email & delete user ([971704a](https://github.com/remoodle/core/commit/971704a81889d28027bc10a7208836aac897bef8))
* search and database improvments ([b05f683](https://github.com/remoodle/core/commit/b05f6837eea9f7f8ae3f546b57f4bebf8c03abb5))
* support course content ([eec5160](https://github.com/remoodle/core/commit/eec51601dff4dc24cf049a91ce8dcca7d8970af9))


### Bug Fixes

* add resolving rule for auth middleware ([d073141](https://github.com/remoodle/core/commit/d07314160225233e762bdb31d713b76fb55578b7))
* **cd:** strip ::refs_heads_main from version tag ([8238ada](https://github.com/remoodle/core/commit/8238ada5012c0ee3bcbab2334e1dfa46fdf203c0))
* change data type for summary column ([1317602](https://github.com/remoodle/core/commit/1317602e40762e129f6f5dd0b0f5467a2745553e))
* change data type to longtext ([f932e25](https://github.com/remoodle/core/commit/f932e2510ac65407fb90d0d1a3fdf1263eb739d1))
* change grade constraint ([f662c9b](https://github.com/remoodle/core/commit/f662c9baca207af0c8b3280b8690dc8d0158234f))
* **Command:** test release-kal ([690b95d](https://github.com/remoodle/core/commit/690b95d7b362d545802c61e385b95d9bfa7ae14b))
* cringe ahh ([8abbb1c](https://github.com/remoodle/core/commit/8abbb1ca2b8d735711f2f4282930717ab0fe431f))
* dockerfile ([c3be2e5](https://github.com/remoodle/core/commit/c3be2e52cd53ca416aad67cbc28f982db2f729e1))
* fix course grades ([7f6f078](https://github.com/remoodle/core/commit/7f6f07856d22bd3bc8c03aff08b6265d57a76550))
* fix course grades ([28f0210](https://github.com/remoodle/core/commit/28f0210384dbf82cd912d9ffb2e62d4c085bfc86))
* fix course name ([e27ded6](https://github.com/remoodle/core/commit/e27ded6f57dad89ded19c86942c23047ce2aa96c))
* fix grade missmatch ([3aaf210](https://github.com/remoodle/core/commit/3aaf21043bd3ee9e8005af0c67831034ca1103d7))
* fix grades ([c7e5b7f](https://github.com/remoodle/core/commit/c7e5b7fdc0c98e63988ed48b59ee3c977fa1e059))
* fix KV key values ([3329743](https://github.com/remoodle/core/commit/332974319990880165e24bdd96c2cb7a9637f326))
* fix rr.yaml configuratuin for cors ([a7d01b1](https://github.com/remoodle/core/commit/a7d01b1ad9d11c903e73f3fe01ea84622b43abc6))
* fix search ([aea2745](https://github.com/remoodle/core/commit/aea2745697405f12d67d246c13e0ec17c77bfb2a))
* fully switched from barcode to username ([cb2b7fe](https://github.com/remoodle/core/commit/cb2b7fef09b421c9594481ede4168438b184fb65))
* incorrect queue selection in service ([a81db78](https://github.com/remoodle/core/commit/a81db784f09d3a4084aba02937e448b63496db1e))
* make hotfix ([c9e0064](https://github.com/remoodle/core/commit/c9e0064667a9396eff163c82d328566d34e539f8))
* make module url nullable ([cdd817c](https://github.com/remoodle/core/commit/cdd817c8ea4c81dab1eb6ed3fba8fd84307545d1))
* publish on push to main branch ([3499108](https://github.com/remoodle/core/commit/349910887aa24d717d5f63cc53d4e224ae637aaa))
* **Queues:** fix due to refactor ([cc2c9ae](https://github.com/remoodle/core/commit/cc2c9ae8cbd4de677eaa730a9fc2e28bf01ade4c))
* remove kal ([bf56778](https://github.com/remoodle/core/commit/bf567786cabb1c8fa7301fa61ad65fac44b465ee))
* remove some kal ([39952d9](https://github.com/remoodle/core/commit/39952d97adb8f2d1d349e3e8f02bc6d44155278f))
* remove some kal ([fbe1b2e](https://github.com/remoodle/core/commit/fbe1b2ef67bbf4bc1c7bbb95db295d46ba3a721a))
* transaction on register ([61e56bc](https://github.com/remoodle/core/commit/61e56bcb3da75f6055a942a3884f495d5937f818))


### Reverts

* dockerfile changes ([5d631d0](https://github.com/remoodle/core/commit/5d631d096c05b69d6b10a385a4bf4859cb02b0d5))


### Miscellaneous Chores

* add mbstring extension to dockerfile ([f3e49d9](https://github.com/remoodle/core/commit/f3e49d93816b9035ae44c7214e0c2f9d1b3c528e))
* add metrics ([e38848e](https://github.com/remoodle/core/commit/e38848efcf6f56191d2e49f47513ada003574826))
* add middleware to config ([0e6d1c6](https://github.com/remoodle/core/commit/0e6d1c61497a8031e841fa17a9c0bf91c232bd1e))
* update config ([b4956fb](https://github.com/remoodle/core/commit/b4956fbb49a013595a2ba1f17ec7d3284dcd6959))
* update gitignore ([d10ccf1](https://github.com/remoodle/core/commit/d10ccf1e17ec4629ee544ab33836981fd03c36fb))
* update rr ([f77798e](https://github.com/remoodle/core/commit/f77798e8f49ffc243d59e3cbe3691713748383e8))
