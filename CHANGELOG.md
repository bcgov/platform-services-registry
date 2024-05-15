## [0.23.8](https://github.com/bcgov/platform-services-registry/compare/v0.23.7...v0.23.8) (2024-05-15)
## [0.23.7](https://github.com/bcgov/platform-services-registry/compare/v0.23.6...v0.23.7) (2024-05-15)
## [0.23.6](https://github.com/bcgov/platform-services-registry/compare/v0.23.5...v0.23.6) (2024-05-15)

### Bug Fixes

* public cloud user-roles link ([fdf3924](https://github.com/bcgov/platform-services-registry/commit/fdf392487e75410885cad3098595f192a9d2de5f))
## [0.23.5](https://github.com/bcgov/platform-services-registry/compare/v0.23.4...v0.23.5) (2024-05-14)

### Features

* **2713:** update csv download file format ([c75084a](https://github.com/bcgov/platform-services-registry/commit/c75084a05edbf4439d6976b380d3ee44191da273))
* deploy m365 to dev ([0a868ea](https://github.com/bcgov/platform-services-registry/commit/0a868ea3d23663fdea472dd77b1e1dcf8ed28892))
* **QOL:** users can now view what permissions they currently have ([49d1097](https://github.com/bcgov/platform-services-registry/commit/49d109728d3c15023e060f193b1c1189cbb5cd15))
* **QOL:** users can now view what permissions they currently have ([7a702be](https://github.com/bcgov/platform-services-registry/commit/7a702be8f8f9a15f81bed3a5e91361ac778beb0d))
* **QOL:** users can now view what role they currently have via the drop down menu ([a723022](https://github.com/bcgov/platform-services-registry/commit/a723022462eb22e5d911073602cdf0c4712b2d89))
* replace classname to style for better performance ([30b9ae9](https://github.com/bcgov/platform-services-registry/commit/30b9ae9d60f27eeae60740f095a57a1abbd5be7d))
* upgrade m365 proxy server ([1beaa05](https://github.com/bcgov/platform-services-registry/commit/1beaa056b54162e6c896fee0df16c75689f3bbb3))

### Bug Fixes

* **emails:** create, edit, and delete request emails now mention who actioned the request ([6491147](https://github.com/bcgov/platform-services-registry/commit/6491147c6cf3d37cd24cdeca99f4ba14d0daccd8))
* send correct public cloud emails on request type ([eb169c0](https://github.com/bcgov/platform-services-registry/commit/eb169c062281238b09fca264be93abefd6470036))

### Refactors

* update request decision page url ([4ed8827](https://github.com/bcgov/platform-services-registry/commit/4ed8827e0e9032a4c231b3cde4818b29dbccd194))
* update request decision page url in public ([7176db3](https://github.com/bcgov/platform-services-registry/commit/7176db3dcd05b16b6a37c0de4d771db9c40d3d49))
* update request decision page url in public ([ef4b263](https://github.com/bcgov/platform-services-registry/commit/ef4b263b60c80b2bf0fe2ce686f62ba81f7ca660))
## [0.23.4](https://github.com/bcgov/platform-services-registry/compare/v0.23.3...v0.23.4) (2024-05-09)

### Bug Fixes

* add timestamp on resend/reprovision nats msg ([f924e1c](https://github.com/bcgov/platform-services-registry/commit/f924e1c8208003123d493b1cd1af498d1e024abf))
## [0.23.3](https://github.com/bcgov/platform-services-registry/compare/v0.23.2...v0.23.3) (2024-05-07)

### Refactors

* organize email templates in layout ([4c25af0](https://github.com/bcgov/platform-services-registry/commit/4c25af0fea3af3ab367f856c1f2365287ef0b4ac))
## [0.23.2](https://github.com/bcgov/platform-services-registry/compare/v0.23.1...v0.23.2) (2024-05-07)

### Features

* **2229:** separate provisioning of golddr cluster ([4665edd](https://github.com/bcgov/platform-services-registry/commit/4665edd53b2371a16dc32a7b1bf5938af5c75e5c))
* **2249:** add logger for backend ([013d3f3](https://github.com/bcgov/platform-services-registry/commit/013d3f3c029ba8ee9187dfc139a248d7771bd88f))
* **2556:** store user image in db ([9e47fe2](https://github.com/bcgov/platform-services-registry/commit/9e47fe2214c2357805b99a709edb20ad9f3b5289))
* **2645:** ignore Form validations on Delete Requests ([7d47d60](https://github.com/bcgov/platform-services-registry/commit/7d47d60964580b5d63e9c6c2a93356b91b332d3f))
* add externalLink generic component ([84259b3](https://github.com/bcgov/platform-services-registry/commit/84259b326e81e4a8ea024b36f112c2b0dd80c741))
* add generic checkbox component ([568c1c7](https://github.com/bcgov/platform-services-registry/commit/568c1c7f65b075cbcb28508b6de6b5ae9857be6d))
* add golddrEnabled field ([74c0c81](https://github.com/bcgov/platform-services-registry/commit/74c0c815ae610df07b109f6646af9a1d00e750cf))
* add mailLink generic component ([dbdd293](https://github.com/bcgov/platform-services-registry/commit/dbdd293ec551a1b442c8bbba12f93c8c7e02661b))
* add view history document permission ([c9de09e](https://github.com/bcgov/platform-services-registry/commit/c9de09e9159e9300bb46cb173c7176f69f4e0794))
* **comments:** added confirmation box for deleting a comment, and success toast ([5b263b7](https://github.com/bcgov/platform-services-registry/commit/5b263b7a45d4db2e958984152063e0e76342ba9f))
* **comments:** delete a comment through UI ([54b3dc3](https://github.com/bcgov/platform-services-registry/commit/54b3dc3093b48036c3010579c30b17bd2f83c201))
* **comments:** edit a comment through the UI ([d3705b4](https://github.com/bcgov/platform-services-registry/commit/d3705b4bf3715b69f6f372bad4f7a12646089fad))
* signout from keycloak along with app backend ([0efde47](https://github.com/bcgov/platform-services-registry/commit/0efde47710ac596cf868442a7589a8c556e8ba5d))
## [0.23.1](https://github.com/bcgov/platform-services-registry/compare/v0.23.0...v0.23.1) (2024-04-29)
## [0.23.0](https://github.com/bcgov/platform-services-registry/compare/v0.22.3...v0.23.0) (2024-04-29)

### Features

* **1954:** add client base page component ([b30a10f](https://github.com/bcgov/platform-services-registry/commit/b30a10f336fe64521323268880fd1a6c89a39c7f))
* **1954:** add server base page component ([361e705](https://github.com/bcgov/platform-services-registry/commit/361e705a1beec13524c4c6b851b03345bbea03e2))
* add generic modal component ([60102c4](https://github.com/bcgov/platform-services-registry/commit/60102c4ff758400776c8917d5996efe374420595))
* add generic select component ([ba2c722](https://github.com/bcgov/platform-services-registry/commit/ba2c7225940c3da8cc7555b027f3ac3378a043da))
* add generic table components ([4700591](https://github.com/bcgov/platform-services-registry/commit/47005911368ee035deb62ec8d7b36f4d06eee2df))
* add generic toggle component ([723400a](https://github.com/bcgov/platform-services-registry/commit/723400ab3350979b0140b4c92098a97b5729c9fc))
* add light & export buttons ([ba0d845](https://github.com/bcgov/platform-services-registry/commit/ba0d845237b32f6d8d4f0b8d0ac7f8e2669c06a9))
* add private products search/download api endpoints ([b6b4959](https://github.com/bcgov/platform-services-registry/commit/b6b4959f2f1723df2258dcfe720e5236e06314e0))
* **comments:** created stylized comment bubbles ([2b5e445](https://github.com/bcgov/platform-services-registry/commit/2b5e44533950475aef61ce205acad063fadac457))
* convert private list page to client rendering ([e190c98](https://github.com/bcgov/platform-services-registry/commit/e190c98de057bb8feec961b72c762a9ee5836fcb))
* convert private request list page to client rendering ([c612098](https://github.com/bcgov/platform-services-registry/commit/c61209815b4d988801568eaa4937dc6859d2dca3))
* convert public list page to client rendering ([d3f9ac7](https://github.com/bcgov/platform-services-registry/commit/d3f9ac787b3ba33cdf239af2303d4e3347e5ae0d))
* convert public request list page to client rendering ([8096eb7](https://github.com/bcgov/platform-services-registry/commit/8096eb70c8784f6fce38644849ffbb81013bd418))
* created stylized comments bubbles ([33bd1de](https://github.com/bcgov/platform-services-registry/commit/33bd1de439fc47ffe5c55ea8121efea55822dbfb))
* history tab and request page for public cloud ([#2544](https://github.com/bcgov/platform-services-registry/issues/2544)) ([402d470](https://github.com/bcgov/platform-services-registry/commit/402d4700f6451384adeaf6adcdb0e08337e0dc57))
* set user session timeout configuration ([e94b3a8](https://github.com/bcgov/platform-services-registry/commit/e94b3a86de75df289c83ae6eba1902a25c768a35))

### Bug Fixes

* comments box for rejection decision only ([2674a26](https://github.com/bcgov/platform-services-registry/commit/2674a26dd957ebfb5dbb040a324d142cb6ecff84))
* correct subject for admin edit request email ([051be5b](https://github.com/bcgov/platform-services-registry/commit/051be5b2dafdd666e80360be05789abd407011f0))
* **private-email:** admins now notified of a delete request ([51e2c27](https://github.com/bcgov/platform-services-registry/commit/51e2c2785ce65825ecdad184185582c16e4dcb6a))
* **private-email:** send delete approval email after provisioning has been complete ([258414f](https://github.com/bcgov/platform-services-registry/commit/258414fe35e331df8b5a1e72be2267c2c16ed5be))
* rejection email now has correct content according to docs ([5aea799](https://github.com/bcgov/platform-services-registry/commit/5aea79905161ce80a226f4910377022e2d1bde28))
* send correct emails given scenario, refactored approval email content ([907fcb2](https://github.com/bcgov/platform-services-registry/commit/907fcb2f87d95b1b41eeb26d6fd438526d561f2e))

### Docs

* **private-email:** update scenario 4 consistency ([3fd4d5e](https://github.com/bcgov/platform-services-registry/commit/3fd4d5e9f6bfa49b43fffee56d2bbd247cc05696))
* updated private cloud email scenarios documentation Scenario 2 ([bf81426](https://github.com/bcgov/platform-services-registry/commit/bf81426815a03636ef5197b1485ff31fb787c946))

### Refactors

* organize create routes based on restful spec ([6869424](https://github.com/bcgov/platform-services-registry/commit/6869424c964998198e74baf75d5d2ede73af46d2))
* organize frontend/backend routes ([083baea](https://github.com/bcgov/platform-services-registry/commit/083baeae3117ded63cb063b3dce63f9993b8b925))
* organize read/update routes based on restful spec ([13e2b55](https://github.com/bcgov/platform-services-registry/commit/13e2b551a31c587be626711c32b7fd5e68ac4917))
* re-organize other cloud routes ([915f3ef](https://github.com/bcgov/platform-services-registry/commit/915f3efe57ba3a8c8030be58b3db8741ae01858c))
* re-organize private cloud routes ([2cd3204](https://github.com/bcgov/platform-services-registry/commit/2cd3204af7df1b1cbe972fd4f02592bb249b922f))
* re-organize public cloud routes ([f7181c9](https://github.com/bcgov/platform-services-registry/commit/f7181c9ca2dbae08b3ce2ac09709d1f3c9a7a67b))
## [0.22.3](https://github.com/bcgov/platform-services-registry/compare/v0.22.1...v0.22.3) (2024-04-18)

### Features

* add comments by a textbox ([8afdf6e](https://github.com/bcgov/platform-services-registry/commit/8afdf6e72fa4684c48ee2545073c9b5ce743491e))
* added comments tab, display comments in UI ([06e2b45](https://github.com/bcgov/platform-services-registry/commit/06e2b45c7a4e34fc57185b027323345225ed1840))
* **frontend:** add buttons to copy licensePlate to clipboard ([6b5720a](https://github.com/bcgov/platform-services-registry/commit/6b5720a80bee5aae771a40f2c73772c06f455453))
* **frontend:** add buttons to copy licensePlate to clipboard ([d87f6ad](https://github.com/bcgov/platform-services-registry/commit/d87f6ad21431fbfc613bc2f0b88e5b5ede81b9ee))
* history tab mockup implemented ([#2498](https://github.com/bcgov/platform-services-registry/issues/2498)) ([164c68d](https://github.com/bcgov/platform-services-registry/commit/164c68d2c59dbac3aa98882a75f4d2373b1ab4e6))

### Bug Fixes

* add check for Decode JWT token header ([c197b8b](https://github.com/bcgov/platform-services-registry/commit/c197b8b3cb796aaa698601453f613d0540bd07c6))
* change permission for private cloud admin to see LAB clusters in drop down ([#2472](https://github.com/bcgov/platform-services-registry/issues/2472)) ([080a3c5](https://github.com/bcgov/platform-services-registry/commit/080a3c5b232a8f80c1b77425770bfb64ee2556be))
* check is Expense authority form is filled in for public cloud product before deletion ([#2454](https://github.com/bcgov/platform-services-registry/issues/2454)) ([abfddcc](https://github.com/bcgov/platform-services-registry/commit/abfddcceced0d7185a5b7eea7d5967896cc9be56))
* **frontend:** fix tooltip shown for multiple rows ([de800c0](https://github.com/bcgov/platform-services-registry/commit/de800c07836d383309a56e40e478ad9be9638162))
* hide comments section on prod ([53e7c10](https://github.com/bcgov/platform-services-registry/commit/53e7c10a8e32df4295127f6a43c1c3d36216ba43))
* layout now consistent with other tabs ([d603066](https://github.com/bcgov/platform-services-registry/commit/d6030666ce65327ad11203c5db2fcfa7e9c8ced5))
* switch permission from private to public admins ([#2462](https://github.com/bcgov/platform-services-registry/issues/2462)) ([ad57b60](https://github.com/bcgov/platform-services-registry/commit/ad57b6000b3cb6509373503af2c6141d352563a5))
* use useQuery, and useMutation for comments logic ([f2348e7](https://github.com/bcgov/platform-services-registry/commit/f2348e7b1ce7567df3af10701e531f8d2b3b2dde))
## [0.22.1](https://github.com/bcgov/platform-services-registry/compare/v0.22.0...v0.22.1) (2024-04-04)

### Features

* add updatedAt field to comments ([ed971c3](https://github.com/bcgov/platform-services-registry/commit/ed971c30118f052c1ef95cbd490ff284cc40c129))

### Refactors

* api handler, next response, param validation ([#2421](https://github.com/bcgov/platform-services-registry/issues/2421)) ([bf02663](https://github.com/bcgov/platform-services-registry/commit/bf026633042e50c2e3eab1bb287be10d7136d6af))
## [0.22.0](https://github.com/bcgov/platform-services-registry/compare/v0.21.0...v0.22.0) (2024-03-22)

### Features

* add reprovision endpoint along with resend ([08cbb54](https://github.com/bcgov/platform-services-registry/commit/08cbb540ce20e18ef8ce061339befd9958db1adb))
## [0.21.0](https://github.com/bcgov/platform-services-registry/compare/v0.20.2...v0.21.0) (2024-03-22)

### Features

* add re-provisioning function ([fb5b0d1](https://github.com/bcgov/platform-services-registry/commit/fb5b0d13eb78c9c98f4ef59de3d1518f7575eb3d))
* enhance data validation in v1 api endpoints ([bc7a275](https://github.com/bcgov/platform-services-registry/commit/bc7a2758b5ff1f142d04b25b24cc324e4ff52790))
* logic for delete comment by id api ([b9c99d0](https://github.com/bcgov/platform-services-registry/commit/b9c99d0e279de9ae5540ed8265ec4294fcd27432))
* logic for list all comments api ([d3fb8ee](https://github.com/bcgov/platform-services-registry/commit/d3fb8ee7277436c3b55569e4d5411e0af2b01933))
* logic for read comment by id api logic ([4167255](https://github.com/bcgov/platform-services-registry/commit/4167255c9a11e966085028090ad6c08ca2319090))
* logic for update comment by id api ([94e939b](https://github.com/bcgov/platform-services-registry/commit/94e939b3083affbdea6fdb4c795fc4c721a6c3ed))
## [0.20.2](https://github.com/bcgov/platform-services-registry/compare/v0.20.1...v0.20.2) (2024-03-22)

### Bug Fixes

* use auth server instead of auth base url ([44627e8](https://github.com/bcgov/platform-services-registry/commit/44627e8b114fc521610d9a6564c265cb452b413b))
## [0.20.1](https://github.com/bcgov/platform-services-registry/compare/v0.20.0...v0.20.1) (2024-03-21)

### Features

* **2320:** migreate gitops apis ([e4f60d1](https://github.com/bcgov/platform-services-registry/commit/e4f60d12b0226a581a89abf46015d5cf0e0563f8))

### Bug Fixes

* add get user by email ([#2353](https://github.com/bcgov/platform-services-registry/issues/2353)) ([8f2576c](https://github.com/bcgov/platform-services-registry/commit/8f2576c2aa6d184290db7b631d961659fe52778e))
## [0.20.0](https://github.com/bcgov/platform-services-registry/compare/v0.19.1...v0.20.0) (2024-03-21)

### Features

* add editor roles ([11dee64](https://github.com/bcgov/platform-services-registry/commit/11dee64c7293600d523edb6759d23217fb47c13a))
* add total quotas in csv exports ([82de485](https://github.com/bcgov/platform-services-registry/commit/82de4855edb031d2aca7d40b6dd4d9908b39acb1))
* create comment api ([be32408](https://github.com/bcgov/platform-services-registry/commit/be32408fe69d37370e2429ab96a912552300e9fd))
* sort functionality to public and private products and requests ([#2344](https://github.com/bcgov/platform-services-registry/issues/2344)) ([b514f85](https://github.com/bcgov/platform-services-registry/commit/b514f8544d9b309426adddcdc50da9cfadef67c4))
## [0.19.1](https://github.com/bcgov/platform-services-registry/compare/v0.19.0...v0.19.1) (2024-03-20)

### Bug Fixes

* fix data migration scripts ([6142afa](https://github.com/bcgov/platform-services-registry/commit/6142afa8b25beb1a1f96cecdc0f8ebac45824f45))
## [0.19.0](https://github.com/bcgov/platform-services-registry/compare/v0.18.1...v0.19.0) (2024-03-19)

### Features

* add data migration to populate missing fields ([ae02860](https://github.com/bcgov/platform-services-registry/commit/ae02860b47b9ef2cb1fead759945c1fdd55497fa))
* add ministry editor roles ([f450e58](https://github.com/bcgov/platform-services-registry/commit/f450e58691e142e085b4984aa248e382369eb015))
* add private & public roles in keycloak ([7e595b7](https://github.com/bcgov/platform-services-registry/commit/7e595b7bc011b63cfce114f5c3ccac347f9c563e))
* add vanity url into terraform production client ([#2293](https://github.com/bcgov/platform-services-registry/issues/2293)) ([5f57ea5](https://github.com/bcgov/platform-services-registry/commit/5f57ea54abe69781c4f4bfc5e714230092c92371))
* apply security layers on product list page ([cc46be9](https://github.com/bcgov/platform-services-registry/commit/cc46be9d6f980b5aabbbffc595ab77d777642620))
* lowercase user emails ([babd957](https://github.com/bcgov/platform-services-registry/commit/babd9573459d2fe57e1eedd3617c122f8087cfb6))

### Bug Fixes

* update missing updated_at ([f07f32d](https://github.com/bcgov/platform-services-registry/commit/f07f32dea3b88630e7cfa40a43cbc5287243c3bf))

### Refactors

* deprecate aggregate db query ([0a629e6](https://github.com/bcgov/platform-services-registry/commit/0a629e648a0007442904ae7e7c160f209b2c579f))
* enhance api handler types ([df9696a](https://github.com/bcgov/platform-services-registry/commit/df9696ae2cce185c359848ca043b37a6ab620a4c))
* enhance mock session generation ([0af738a](https://github.com/bcgov/platform-services-registry/commit/0af738a811b05cfb8a4f619c60a8b848590f5ff4))
* merge duplicate email users ([c984867](https://github.com/bcgov/platform-services-registry/commit/c984867448fc21f1a452e179214b6a17ca36071f))
* migrate data to update old data ([05c2932](https://github.com/bcgov/platform-services-registry/commit/05c29327d81007bcec2dab061f33328a0d053f95))
* optimize codebase according to roles & permissions ([4feacbd](https://github.com/bcgov/platform-services-registry/commit/4feacbd867fce3cfc03055275af8daf11ff88109))
* optimize delete api endpoints ([970ac90](https://github.com/bcgov/platform-services-registry/commit/970ac9015db6189cfb7dbd60dbb60b374b2f708e))
## [0.18.1](https://github.com/bcgov/platform-services-registry/compare/v0.18.0...v0.18.1) (2024-03-14)

### Features

* **analytics:** filter private cloud requests by prod productions ([1158948](https://github.com/bcgov/platform-services-registry/commit/11589481f1293b9c225bbc1d39e671380835be99))

### Bug Fixes

* add user aws roles issue, hide histroy tab from prod ([#2279](https://github.com/bcgov/platform-services-registry/issues/2279)) ([35c1caf](https://github.com/bcgov/platform-services-registry/commit/35c1cafa54752623b42baf9600697a1b4875c415))

### Docs

* update db backup steps ([c2ffe13](https://github.com/bcgov/platform-services-registry/commit/c2ffe1333cc203975e8cec90b30b9428c50ee784))
## [0.18.0](https://github.com/bcgov/platform-services-registry/compare/v0.17.0...v0.18.0) (2024-03-13)

### Features

* add update-db make script ([b485016](https://github.com/bcgov/platform-services-registry/commit/b4850167272bcd5d7add2d61962629452acaabb1))
* restrict certain special characters from entering in public project name ([d938ca9](https://github.com/bcgov/platform-services-registry/commit/d938ca976aa8e2754462660af008c0ae5c7b440c))
* setup restful api for comments ([c373319](https://github.com/bcgov/platform-services-registry/commit/c373319d2465e48ba34fd2b157865f63487c2ea6))

### Bug Fixes

* fix issue with deletion provisioned email for public cloud ([#2267](https://github.com/bcgov/platform-services-registry/issues/2267)) ([ae056b1](https://github.com/bcgov/platform-services-registry/commit/ae056b14ed9457d79a146d0145372b2eff2a2eb1))
* resolve issues when deleting projects ([c57986c](https://github.com/bcgov/platform-services-registry/commit/c57986cf2feced45e02912883380ea45f773bb7e))
## [0.17.0](https://github.com/bcgov/platform-services-registry/compare/v0.16.0...v0.17.0) (2024-03-07)

### Features

* **1733:** Comment model is now PrivateCloudComment ([eae6428](https://github.com/bcgov/platform-services-registry/commit/eae64281df2dfd2826277d41484cc5455712cc24))
* **1733:** more meaningful name + formatting ([9b37f88](https://github.com/bcgov/platform-services-registry/commit/9b37f881b7809d7eda8435961a9992f952e8c177))
* **2110:** add portfolio per ministry pie charts in public cloud ([2008ba7](https://github.com/bcgov/platform-services-registry/commit/2008ba7e8998748b42dc4c1d300e3df7d766b93b))
* add approver in keycloak terraform ([3d67e59](https://github.com/bcgov/platform-services-registry/commit/3d67e5919ef2ccc66d4bc474288a5fe25adff427))
* add check for ag ministries ([#2148](https://github.com/bcgov/platform-services-registry/issues/2148)) ([7ac3873](https://github.com/bcgov/platform-services-registry/commit/7ac3873a416123aa45eb7a6faa30d36c6ceb3610)), closes [#2154](https://github.com/bcgov/platform-services-registry/issues/2154)
* add data migrations workflow ([9d77841](https://github.com/bcgov/platform-services-registry/commit/9d7784184fdcb0d643e47de687e184efc4bef9e4))
* add expense authority for public cloud product ([#2192](https://github.com/bcgov/platform-services-registry/issues/2192)) ([fdb2a6c](https://github.com/bcgov/platform-services-registry/commit/fdb2a6cff92a3f51344b2238301adf75d9935758))
* add housing ministry into AG alliance list ([896f552](https://github.com/bcgov/platform-services-registry/commit/896f55239cf33f2200831c42191f3f78c7e0f6db))
* add knip and removed unused ([bbcd3f5](https://github.com/bcgov/platform-services-registry/commit/bbcd3f5aebf579f1587696c5c666d2fa76db9d50))
* add mock-up provisioner in local env ([176887c](https://github.com/bcgov/platform-services-registry/commit/176887cd8f0ea1e4ed696bf98ad9ff1f3efe1740))
* add request comment in public cloud ([a1a92b8](https://github.com/bcgov/platform-services-registry/commit/a1a92b8ff3db85ea15c5609d89710144e3e4feb7))
* add top level roles in session ([efffb4b](https://github.com/bcgov/platform-services-registry/commit/efffb4ba4e93e6533fdd871ae00ff61a6884f22d))
* clean up ms query data ([384dcd3](https://github.com/bcgov/platform-services-registry/commit/384dcd394c41551c8cac39add6c205a915f599fb))
* comment model schema w/ reactions ([cadfcb9](https://github.com/bcgov/platform-services-registry/commit/cadfcb9b9e951632cec1c2c3ebd6028993731df0))
* deploy mock nats server in dev environment ([33dcb28](https://github.com/bcgov/platform-services-registry/commit/33dcb2866ebf282aad8b86bd3e58dee357eee062))
* display IDIR, UPN in user search ([640af7a](https://github.com/bcgov/platform-services-registry/commit/640af7a88c300a2437b0d8740627f002814a460b))
* enhance analytics pages ([351284f](https://github.com/bcgov/platform-services-registry/commit/351284fe7ee140cf4365d62decdad4a6599239b2))
* rename comment fields ([f262d56](https://github.com/bcgov/platform-services-registry/commit/f262d56675eb250144448334c30c4637776890aa))
* rename public comment fields ([f39acc6](https://github.com/bcgov/platform-services-registry/commit/f39acc6aed869bcbd693e2d184abe3a74b81abb9))
* separate private & public nats endpoints ([22b9ffb](https://github.com/bcgov/platform-services-registry/commit/22b9ffbc300e953b415fd98fe6535653dfc31fde))
* sort products by updated dates ([1d0ef14](https://github.com/bcgov/platform-services-registry/commit/1d0ef1444357bfd8f30dc4d8f99cebaf54d0f212))
* upsert users when users assinged for products ([873d05f](https://github.com/bcgov/platform-services-registry/commit/873d05fb3814d9475995a9199d528585aff5fb38))

### Bug Fixes

* **1733:** fixed build error in seed ([14f9f0c](https://github.com/bcgov/platform-services-registry/commit/14f9f0c5bfc157165028a17678aa82fd2d38f5c6))
* 2 comments are created per project ([fec97d8](https://github.com/bcgov/platform-services-registry/commit/fec97d84717f10edf7f2078d5bd1ed98729110a7))
* **2003:** various small visual bugs ([84013fb](https://github.com/bcgov/platform-services-registry/commit/84013fb7c8863bad2742388d83c407ba0e5b4d13))
* ensure delete provision falg the product as inactive ([e42b9a1](https://github.com/bcgov/platform-services-registry/commit/e42b9a1f47b2e0272edc068bb3ff793296320051))
* resolve issue on showing deleted products ([9da0da7](https://github.com/bcgov/platform-services-registry/commit/9da0da77bb2574651f45ad1da828558a8acc0d24))
* return modal + hosting tier info for users ([f552a8d](https://github.com/bcgov/platform-services-registry/commit/f552a8d36493dbbac0dced1fcf367b7037faa405))

### Docs

* add email scenarios for private cloud ([2d78021](https://github.com/bcgov/platform-services-registry/commit/2d78021c4d39e70d6d9087f278064eabcc23ceba))
* add email scenarios for public and private cloud ([15908ee](https://github.com/bcgov/platform-services-registry/commit/15908ee393d744a5dd5f657d783a1110b4eb7e1f))
* add tab in the first paragraphs ([52c9656](https://github.com/bcgov/platform-services-registry/commit/52c9656f666013a3e878512744a00ac2f7e2e006))
* update README.md ([8a5b0f6](https://github.com/bcgov/platform-services-registry/commit/8a5b0f6849b1939fd3bbaf8e56373733f421fa85))
## [0.16.0](https://github.com/bcgov/platform-services-registry/compare/v0.15.0...v0.16.0) (2024-02-13)

### Features

* add ACS tasks in upper environments ([5ad6063](https://github.com/bcgov/platform-services-registry/commit/5ad606375fce5151a00c08b47c1acbf95637e99a))
* add bash linter & formatter ([1d31993](https://github.com/bcgov/platform-services-registry/commit/1d319930e40f4ab79ab1fe3bee09b68f6ffeef15))
## [0.15.0](https://github.com/bcgov/platform-services-registry/compare/v0.13.0...v0.15.0) (2024-02-09)

### Features

* display URL sources in sonar scan results ([19dbe22](https://github.com/bcgov/platform-services-registry/commit/19dbe2218775fcb1c3cd830bce6a16a55b597dfa))

### Bug Fixes

* wording, and admin delete email ([4e89814](https://github.com/bcgov/platform-services-registry/commit/4e89814dc1c37f6f654b06cdf851f0b5caf28585))
## [0.13.0](https://github.com/bcgov/platform-services-registry/compare/v0.12.0...v0.13.0) (2024-02-07)

### Features

* search github urls from acs image build metadata ([07edb45](https://github.com/bcgov/platform-services-registry/commit/07edb4525be95de01dcfb82220c7f03b28a88646))

### Bug Fixes

* **1680:** fix comments in emails ([99c0eb7](https://github.com/bcgov/platform-services-registry/commit/99c0eb7a72c3078a62727b139eddd474fb0cced1))
## [0.12.0](https://github.com/bcgov/platform-services-registry/compare/v0.9.1...v0.12.0) (2024-02-06)

### Features

* **1915:** add acs airflow dag ([e4f9053](https://github.com/bcgov/platform-services-registry/commit/e4f9053be25c42954c4f357b041c38f7bce9f50e))
* **1916:** add security dashboard acs views ([97a6c90](https://github.com/bcgov/platform-services-registry/commit/97a6c90e7ea40e03aaa977401d30a6c5b48752bd))
## [0.9.1](https://github.com/bcgov/platform-services-registry/compare/v0.9.0...v0.9.1) (2024-01-30)

### Features

* **1865:** apply KC resources changes on pipeline ([28f18f5](https://github.com/bcgov/platform-services-registry/commit/28f18f5564d1c27d11f1a10d4191e028e8d327d5))
* add sysdig alerts with terraform ([effd21b](https://github.com/bcgov/platform-services-registry/commit/effd21b1d6ec9a09faa14ed9dc4c1a64283a484a))
* delete request email for admins for public cloud ([76e30bc](https://github.com/bcgov/platform-services-registry/commit/76e30bc7c9605719f6dd1005547bc62b8c8db5c3))
* edit request now edit summary for public cloud ([053d991](https://github.com/bcgov/platform-services-registry/commit/053d991c7c98f92a6fca1871d54a0e15b8d1401b))
* move env variables into config file ([8fd7681](https://github.com/bcgov/platform-services-registry/commit/8fd7681543b766edefedfa6bc4a3081e0e8b0a28))
* only allow github bcgov organization repos ([4641551](https://github.com/bcgov/platform-services-registry/commit/4641551cae514d636836513cf90ec29c845f168b))
* **secdash:** order list by scanned date ([465b262](https://github.com/bcgov/platform-services-registry/commit/465b262803ee50d1fb1b996b2b0c32a94c627cd1))
* skip sonarscans if repo has no changes ([65220db](https://github.com/bcgov/platform-services-registry/commit/65220db73d72701074a931762770dbe1eb348ee6))
* **sysdig:** add sysdig alerts for upper environments ([7cb61cb](https://github.com/bcgov/platform-services-registry/commit/7cb61cb89a7c1273f2e0aa01feaaeba3b97f2222))
* updated wording of edit summary ([0d24dc7](https://github.com/bcgov/platform-services-registry/commit/0d24dc719e7c8924cb316cf891916d2ef59ebf99))

### Bug Fixes

* resolve version upgrade issue ([15da9ac](https://github.com/bcgov/platform-services-registry/commit/15da9ac73d554eb8cb785402b7596a56fbde844b))
* use session.roles instead of session.user.roles ([9a79b0a](https://github.com/bcgov/platform-services-registry/commit/9a79b0a0f2f8ab314bd8628fca3ffc8e9af53e60))

### Docs

* update sysdig terraform docs ([f597ae6](https://github.com/bcgov/platform-services-registry/commit/f597ae6f316f5d3c847916b49321e0e64bfe843e))
* update team conventions ([d629672](https://github.com/bcgov/platform-services-registry/commit/d6296723bd7917f197ec8cb291d0a8bb6c9b1dcd))
## [0.9.0](https://github.com/bcgov/platform-services-registry/compare/v0.7.0...v0.9.0) (2024-01-17)

### Features

* add security scan results tabs ([99d5151](https://github.com/bcgov/platform-services-registry/commit/99d5151a73a900a5589aeffd6540d41b7f4c03c5))
* add sonarscan result page ([ab52b3a](https://github.com/bcgov/platform-services-registry/commit/ab52b3acbe05b9cd489f2d7b22d70939b10eeb2e))
* add version # in footer ([2eff74f](https://github.com/bcgov/platform-services-registry/commit/2eff74f7ad2b32d3fc72036f9796449a56f2cad7))

### Bug Fixes

* BudgetChanges logic for PublicEdit ([07d4263](https://github.com/bcgov/platform-services-registry/commit/07d42637b64adc600adfd351c8d9011b78fba4a1))
* email formatting and email changes ([907791a](https://github.com/bcgov/platform-services-registry/commit/907791a9aa06c093c6badd9b43b34d340b4604f7))
* provider details component now completed ([c8789c1](https://github.com/bcgov/platform-services-registry/commit/c8789c112f0163ae4a0c4889f09f9fa8f42f4ea7))
* wording ([e9dc830](https://github.com/bcgov/platform-services-registry/commit/e9dc830e2255cf7ff2a2354f4dc1dfb29fabb8f3))
* wording, formatting, links ([3a72d78](https://github.com/bcgov/platform-services-registry/commit/3a72d786193b309ef44e656d602c1dc819e18988))
## [0.7.0](https://github.com/bcgov/platform-services-registry/compare/v0.5.0...v0.7.0) (2024-01-16)

### Features

* **1728:** add security tab layout ([3271fd8](https://github.com/bcgov/platform-services-registry/commit/3271fd854ef661cf024505604608171d5cf45f39))
* **1728:** update security - repository tab ([7cfb2f8](https://github.com/bcgov/platform-services-registry/commit/7cfb2f814b00545160c525d191a3c3f48d5821da))
* add custom SonarQube scan Dockerfile with entrypoint ([68796d4](https://github.com/bcgov/platform-services-registry/commit/68796d4217ad96a77a0936a35b25892ec476a1ab))
* add security service layer for privateCloudProjectZapResult ([f62a094](https://github.com/bcgov/platform-services-registry/commit/f62a094658564fcf2742fe2ac4890a78c3c9f725))
* add zap results page ([c03d8b9](https://github.com/bcgov/platform-services-registry/commit/c03d8b910012a517c4f6b8857e8ad16f36a75250))
* AlertBox modal for handling confirmation messaages and alerts ([0a8869e](https://github.com/bcgov/platform-services-registry/commit/0a8869e6b6863342893f5c5cbe1d489c3301485e))
* allow idir login option only ([c013d44](https://github.com/bcgov/platform-services-registry/commit/c013d44ce061d53c262e0c20998177cdce0bf0e4))
* **sonarscan:** update static analysis scheduler task ([6f3379b](https://github.com/bcgov/platform-services-registry/commit/6f3379b2f72b5dc1c0c1b2137f6164070ebd7c7d))
* update ministry when user logs in ([bd70335](https://github.com/bcgov/platform-services-registry/commit/bd70335e7c2985663f2358341faae0ed2c51b5b6))
* update security layer ([a5cd797](https://github.com/bcgov/platform-services-registry/commit/a5cd797371fde64e8ae5905bd258125f42878514))
* updated favicon ([2795294](https://github.com/bcgov/platform-services-registry/commit/27952947c5f07888bb6117757c3b36ad3162d260))

### Bug Fixes

* add decimal values in budget field ([9677b39](https://github.com/bcgov/platform-services-registry/commit/9677b39da91544a35f17a55462a911fe751b0f9e))
* added link to quota increase process ([53be5c1](https://github.com/bcgov/platform-services-registry/commit/53be5c13bdf5a822d60865277f355eab50373b99))
* confirm box and isdirty submission for secondary lead form ([7c7605f](https://github.com/bcgov/platform-services-registry/commit/7c7605f759b02f145e8d5c92995c90322403cb9d))
* handle non-string search values ([9d3fdee](https://github.com/bcgov/platform-services-registry/commit/9d3fdeef3d5b4ee164bb3f32af67baed72685237))
* modals now display correct info given the context ([9a0e452](https://github.com/bcgov/platform-services-registry/commit/9a0e45274aa7c7a408d168254e6acda8704e299f))
* redundant curly brackets ([21c9171](https://github.com/bcgov/platform-services-registry/commit/21c91713e75630f8912cf3eb7e0251759a75b149))
* removed unused import ([e7b7760](https://github.com/bcgov/platform-services-registry/commit/e7b7760938e285053d15013d2ad8dd520a94a328))
* use idir as the single IDP ([49bd5f3](https://github.com/bcgov/platform-services-registry/commit/49bd5f36fac1928454f3334e9fbf209a6d8faf3a))
## [0.5.0](https://github.com/bcgov/platform-services-registry/compare/v0.4.0...v0.5.0) (2023-12-27)

### Features

* add api wrapper ([9c30b00](https://github.com/bcgov/platform-services-registry/commit/9c30b00e88d4148a83383b27c1cc2c75c8099b8e))
* add db backup cronjob ([75fbd3a](https://github.com/bcgov/platform-services-registry/commit/75fbd3a76be3767ebd83e86a8462fe1ea8988a6d))
* add helm chart for airflow deployment ([7cf85e1](https://github.com/bcgov/platform-services-registry/commit/7cf85e1ee2e34bb139ebad46e2fd51cc57b58eec))
* add prisma extension to apply security layer ([23c6d0f](https://github.com/bcgov/platform-services-registry/commit/23c6d0f9d7848780cb7edc1fce9a680bfe5ac875))
* add prisma extension to apply security layer ([ad2a8f1](https://github.com/bcgov/platform-services-registry/commit/ad2a8f13f6e8fffd998e07ea456cea90b6cc2d33))
* add wirte base filter in security layer ([6b9a120](https://github.com/bcgov/platform-services-registry/commit/6b9a12048dab5dcdda9f96623e66957a11f811ed))
* add zap vulnerability scanning airflow dag ([e2e8a5f](https://github.com/bcgov/platform-services-registry/commit/e2e8a5ffdbc5eb6f3daab29ade2eead1b7bc593d))
* create config.ts for common variables ([5d0fb96](https://github.com/bcgov/platform-services-registry/commit/5d0fb969b3426a6d2db7324ce428cd8f59b4632a))
* csv export with filtering ([6a23ebd](https://github.com/bcgov/platform-services-registry/commit/6a23ebdba2052bda96574699768634a96658bd14))
* enhance eslint rules ([4f17273](https://github.com/bcgov/platform-services-registry/commit/4f1727382c4da528d3bfaabd30caf8a43bd20552))
* enhance session context in higher level ([99c8929](https://github.com/bcgov/platform-services-registry/commit/99c8929987acf0af20e83b4ad22574ce055578a3))
* new kc clients for new UI ([9b728da](https://github.com/bcgov/platform-services-registry/commit/9b728dab911913078bbc3cd54019c12423d2dfb2))
* new modal for approve/deny an edit request. ([3cbfbb9](https://github.com/bcgov/platform-services-registry/commit/3cbfbb905217541c3a0a9e9e471cb94630a4a17d))
* publish security dashboard related images ([1527f54](https://github.com/bcgov/platform-services-registry/commit/1527f549b86c6a5a366da5ccac9013e7fd0943d4))
* show inactive projects/requests in private cloud ([5c68075](https://github.com/bcgov/platform-services-registry/commit/5c680757fc4fa168875ac0ea01e7e1211231e65e))
* toggle changes depending on requests/products ([6e12d44](https://github.com/bcgov/platform-services-registry/commit/6e12d448ba097071d5ff02768265d0ae339fc48b))
* toggle for public cloud ([39e59e2](https://github.com/bcgov/platform-services-registry/commit/39e59e2c939c622e6a44e6962a059fda377bc005))
* update react-email doc ([68a8baa](https://github.com/bcgov/platform-services-registry/commit/68a8baa4b2d072161a66fd600c7fc3d636ff0755))
* updated favicon ([524b214](https://github.com/bcgov/platform-services-registry/commit/524b214d1a95d13a89b088982eba543ab1a025a8))

### Bug Fixes

* .react-email in .gitignore ([697b5d9](https://github.com/bcgov/platform-services-registry/commit/697b5d9aa3b8f289723da7bcc6d18ee66d279338))
* border not showing in email header ([be75fdb](https://github.com/bcgov/platform-services-registry/commit/be75fdb4a3215b4087a1717c95bf2fd429328444))
* capitalized rejection ([aa883ef](https://github.com/bcgov/platform-services-registry/commit/aa883efa355d3fea4303580d74db0f22040c7a66))
* change logic to handle if active != false or true ([7419d52](https://github.com/bcgov/platform-services-registry/commit/7419d5296f6ef71fbbfe3929ca311ce5624ffab0))
* corrected download button on public-cloud ([11bb232](https://github.com/bcgov/platform-services-registry/commit/11bb23221494b9eead9d3003afe1fb32c7fe03e4))
* fix wording in emails ([ead0ccd](https://github.com/bcgov/platform-services-registry/commit/ead0ccd7e6a5fedd9daa7d5ddf42ac9677b24f6d))
* fix wording in emails ([7f6b1c5](https://github.com/bcgov/platform-services-registry/commit/7f6b1c58ea45f6857628fbf3d0d8d67eadd700dc))
* prefix applies to sendEmail level ([f946581](https://github.com/bcgov/platform-services-registry/commit/f9465816dba4dc7809b2ffb757ab3d7e009bc30c))
* react-email misspell ([bcde965](https://github.com/bcgov/platform-services-registry/commit/bcde9654a93955bcd343a32556757b845ad54d30))
* remove commented out lines ([8debf21](https://github.com/bcgov/platform-services-registry/commit/8debf2158a7e1a27713b9f8922b4a945d5b92f70))
* rename rejection to denial, fix comment modals ([fade899](https://github.com/bcgov/platform-services-registry/commit/fade899d187d46f4eb2e2578c86e68442a0a7f49))
* rename variable name ([7ce297e](https://github.com/bcgov/platform-services-registry/commit/7ce297e0b21fd0d2cf0978d51159eec36969bf52))
* resolved build error for download button behavior ([06b0e03](https://github.com/bcgov/platform-services-registry/commit/06b0e0311cd06acf5a36c9c6862ffbaae62778c1))
* return modal displays note only if its public-cloud ([28f699e](https://github.com/bcgov/platform-services-registry/commit/28f699e96d6653d9a15031de5976903738cddd46))
* update .gitignore for react-email ([b939026](https://github.com/bcgov/platform-services-registry/commit/b939026cabb1f1f2563a84078803bd34f420f61b))
* update db backup deployment config ([69f6255](https://github.com/bcgov/platform-services-registry/commit/69f6255e53eab34294c501446e29f4961a0e8749))
* update wording for rejection emails ([3c03729](https://github.com/bcgov/platform-services-registry/commit/3c03729391708afae54810e1473329dbbd1e6cba))
* updated emailHandler to grab value from config.ts ([b2786d5](https://github.com/bcgov/platform-services-registry/commit/b2786d50ef5aa8fa1be9e2ad5344b9eb854baf9f))
* wording on privatecloud modal and links in modals ([a741c7c](https://github.com/bcgov/platform-services-registry/commit/a741c7cfdc39a48b65d30d89e050b9a446cbce0d))
* wording on privatecloud modal and links in modals ([584d176](https://github.com/bcgov/platform-services-registry/commit/584d1764a1e093cca76416847349fa1fe02b1d20))

### Docs

* add database documents ([91e367c](https://github.com/bcgov/platform-services-registry/commit/91e367c6333e55a3b2fbc943b0ad051de6fe3c36))
## [0.4.0](https://github.com/bcgov/platform-services-registry/compare/v0.3.0...v0.4.0) (2023-11-28)

### Features

* add db migration container and build pipeline ([14d8e02](https://github.com/bcgov/platform-services-registry/commit/14d8e02cbae6b291fabbc21644229812e5c7d2fa))
* add deply dispatch pipeline ([80c6e61](https://github.com/bcgov/platform-services-registry/commit/80c6e616a5d75d36059f073c46a2cb3244955f77))
* add global api response handler ([19ff4ea](https://github.com/bcgov/platform-services-registry/commit/19ff4eafaa2ef21fc4287d733e92339cd89a6e97))
* add ministry role access logic ([#1376](https://github.com/bcgov/platform-services-registry/issues/1376)) ([88308c3](https://github.com/bcgov/platform-services-registry/commit/88308c3e8eb12a5cfd157c8cc4c19d1e0258d08f))
* comments passed from modal to api ([7cbc45b](https://github.com/bcgov/platform-services-registry/commit/7cbc45bee70ba3d7180c17e887f0a00dc42a4aa0))
* editRequest email template ([fcf5b99](https://github.com/bcgov/platform-services-registry/commit/fcf5b996241472d8cdd0f99784dc8fc0169e7f9a))
* install mongodb via helm charts ([d668014](https://github.com/bcgov/platform-services-registry/commit/d6680145e630419144bc1025d2a3bdea849c3355))
* set timeout for ches email requests ([a2a0e3d](https://github.com/bcgov/platform-services-registry/commit/a2a0e3d587fd29b19b1910ae2823c8f1afb34e10))
* update edit request emails to lookup quota ([8dfd2f2](https://github.com/bcgov/platform-services-registry/commit/8dfd2f24709bd9431f846c23cf27edbd1ff6af67))

### Bug Fixes

* made comment modal less confusing ([33b9ddf](https://github.com/bcgov/platform-services-registry/commit/33b9ddfa713695cc1734e342c461d3b800a463ed))
* remove redundant tailwind imports ([08c68b7](https://github.com/bcgov/platform-services-registry/commit/08c68b79b87a513bd1da6419b80c9d1ab8be2ded))
* remove tailwind from newRequest email ([ee094bd](https://github.com/bcgov/platform-services-registry/commit/ee094bdb3805a4c3d7027faefe928f01b2f22e38))
* revert downgrade on faker ([bf5d4fc](https://github.com/bcgov/platform-services-registry/commit/bf5d4fc655e90663b681a8f1f2357834c9bc19e2))
* update react-emails/tailwind ([ac0ba1c](https://github.com/bcgov/platform-services-registry/commit/ac0ba1c1aa194d19dd46d6a9cc786662d49f52ce))
* update style for editRequest ([40c3dc9](https://github.com/bcgov/platform-services-registry/commit/40c3dc95247bf6d981e9a06074f44c8d951abc73))
* used lodash for comparePorjects, removed EditRequest modal to different pr ([9a30489](https://github.com/bcgov/platform-services-registry/commit/9a304892e80fd0710cea8a2f3bfb5eefb7cd57e1))

### Docs

* add git tips ([c27f70c](https://github.com/bcgov/platform-services-registry/commit/c27f70c44f077a01958f049028f7ab97bf0c1c82))
* add security dashboard POC result ([bd691d6](https://github.com/bcgov/platform-services-registry/commit/bd691d686ff6a7b66ee977a0fabac57047b1a69a))
* **clean-codes:** add return-early-pattern ([e9c51be](https://github.com/bcgov/platform-services-registry/commit/e9c51be20377ed7dbfbf791bb095a7194a074fb2))
## [0.3.0](https://github.com/bcgov/platform-services-registry/compare/v0.2.0...v0.3.0) (2023-11-16)

### Features

* **1231:** add secure headers in nextjs config ([f31d90c](https://github.com/bcgov/platform-services-registry/commit/f31d90cd03727a4db3fc7ded44b0f74de8abcbb8))
* **897:** add rows per page selection on paginations ([89635bf](https://github.com/bcgov/platform-services-registry/commit/89635bfaa4581120756adef6c6b89ef0fc072997))
* add nounce to remove 'unsafe-inline' in csp ([46db8cf](https://github.com/bcgov/platform-services-registry/commit/46db8cf5f690a2533b75a7fae30fbc4cb70c0193))
* Added nats messeges ([#1250](https://github.com/bcgov/platform-services-registry/issues/1250)) ([f5abcc2](https://github.com/bcgov/platform-services-registry/commit/f5abcc2d02fbb6d69c64af8e16b6c457fa705cb9))
* send emails for create/approve/reject and more tests ([eac1dbf](https://github.com/bcgov/platform-services-registry/commit/eac1dbf4b28264dbee0bb8b8ba9bdfea15b71b10))

### Bug Fixes

* better type definitions for ches and emails ([79de07c](https://github.com/bcgov/platform-services-registry/commit/79de07cd21769b86bd8d1dbab3ac471e72554dfd))
* change data passed to sendNewRequestEmails to request ([14c027a](https://github.com/bcgov/platform-services-registry/commit/14c027ace7006964e28454283b8e305c240ba7be))
* deny request properly calls email function and pr fixes ([e12d5e4](https://github.com/bcgov/platform-services-registry/commit/e12d5e4e6f186adb546597dc0e8370e7914e2f15))
* organize auth options ([0233ee2](https://github.com/bcgov/platform-services-registry/commit/0233ee20d977eaab792a89b15c5760a86e3c3368))
* remove snapshot testing ([ed5e3a7](https://github.com/bcgov/platform-services-registry/commit/ed5e3a75f75680e303545ac0aba1bd3956e4c66c))
## [0.2.0](https://github.com/bcgov/platform-services-registry/compare/8c6642cd17de15ced6c2c2268b9e1c02e0034be2...v0.2.0) (2023-11-03)

### Features

* **1226:** add deployment pipelines in test & prod ([8eeda41](https://github.com/bcgov/platform-services-registry/commit/8eeda41c806d04f2e7702c446f0080ffe48e53a5))
* **1226:** add release & changelog configurations ([19a87b2](https://github.com/bcgov/platform-services-registry/commit/19a87b28d4134a62068b0b244f92e1dcf4ac691b))
* add deployment helm charts ([fc177c4](https://github.com/bcgov/platform-services-registry/commit/fc177c4252650aedc7b2ea0297b8f40b8e91fb3f))
* add development sandbox ([a69cb95](https://github.com/bcgov/platform-services-registry/commit/a69cb9586671e52e90a94879afd28e59ff80a55e))
* CHES endpoint and header template ([3e3393a](https://github.com/bcgov/platform-services-registry/commit/3e3393acacaf301509434f50fe3cc34e5a557e74))
* create oc service accounts ([940d948](https://github.com/bcgov/platform-services-registry/commit/940d9486e0b49b9c2517b3b4dc55246a9a0d332c))
* product details ([5ebad12](https://github.com/bcgov/platform-services-registry/commit/5ebad1215c7666151e0f7d600f3d91148e27385a))
* provide default userImage ([bc49ca2](https://github.com/bcgov/platform-services-registry/commit/bc49ca2d965668c33d6bce17d3d3e7c8d747347a))

### Bug Fixes

* **1235:** resolvenode-fetch Headers importing issue ([489a731](https://github.com/bcgov/platform-services-registry/commit/489a731c29a601678967ccd417926ae9c7014ec8))
* pagination number and avatar ([a00af1b](https://github.com/bcgov/platform-services-registry/commit/a00af1bb70db15c4b6c24b518131c198b30e0d7c))

### Docs

* add developer guide ([8c6642c](https://github.com/bcgov/platform-services-registry/commit/8c6642cd17de15ced6c2c2268b9e1c02e0034be2))
* remove duplicate example ([01b7e02](https://github.com/bcgov/platform-services-registry/commit/01b7e02f3dc0ea35381dcb5bae9f3eb086800f67))
* update developer-guide ([ca5e1fa](https://github.com/bcgov/platform-services-registry/commit/ca5e1fad9a0b271021aeab343f52d1dca5a24712))
* update team conventions ([60499b4](https://github.com/bcgov/platform-services-registry/commit/60499b429828500f65de6a5321f25a4af2bbb2a5))
* update team conventions ([9160ac4](https://github.com/bcgov/platform-services-registry/commit/9160ac40ab9e284c38470e213c924a25935df89d))

### Refactors

* **1235:** update useQuery syntax accordingly to the new version ([f7a48cd](https://github.com/bcgov/platform-services-registry/commit/f7a48cd7ce3e3c8ff10c92baf11f957aba3d9538))
