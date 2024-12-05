## [0.42.0](https://github.com/bcgov/platform-services-registry/compare/v0.41.1...v0.42.0) (2024-12-05)

### Features

* **4093:** add task type 'Review Requests' ([1884c0f](https://github.com/bcgov/platform-services-registry/commit/1884c0fe2a3784745ae602d0cc0382dcf140685d))
* **4188:** provide input box for resource requests ([c672284](https://github.com/bcgov/platform-services-registry/commit/c672284cb53636ae33bfdad3967ac2e25190297a))

### End-to-end Testing

* **4125:** edit request for public cloud and couple of fixes ([e6adb46](https://github.com/bcgov/platform-services-registry/commit/e6adb464992232b22e83db528eaad457e9a41c2e))
## [0.41.1](https://github.com/bcgov/platform-services-registry/compare/v0.41.0...v0.41.1) (2024-12-03)

### Features

* **4368:** add user reader role ([549aaad](https://github.com/bcgov/platform-services-registry/commit/549aaad302799841476f4c1d2cafa429bae6a0f9))
## [0.41.0](https://github.com/bcgov/platform-services-registry/compare/v0.40.6...v0.41.0) (2024-11-29)

### Features

* **4363:** add export function on users page ([e4b756f](https://github.com/bcgov/platform-services-registry/commit/e4b756f143371556b4b6f15d39a129f870b50c16))
## [0.40.6](https://github.com/bcgov/platform-services-registry/compare/v0.40.5...v0.40.6) (2024-11-29)
## [0.40.5](https://github.com/bcgov/platform-services-registry/compare/v0.40.4...v0.40.5) (2024-11-29)
## [0.40.4](https://github.com/bcgov/platform-services-registry/compare/v0.40.3...v0.40.4) (2024-11-28)

### Features

* **4304:** add user role update function in users page ([9cc1daa](https://github.com/bcgov/platform-services-registry/commit/9cc1daabd6f9579bad153dff739c8845b33902d9))
## [0.40.3](https://github.com/bcgov/platform-services-registry/compare/v0.40.2...v0.40.3) (2024-11-22)

### Features

* **3190:** display product requests comments ([b53a8e6](https://github.com/bcgov/platform-services-registry/commit/b53a8e6640e2194ddf042ab1ff56abfd0fb43124))
* **3418:** display subnet info for namespace in emerald cluster ([cc1cd04](https://github.com/bcgov/platform-services-registry/commit/cc1cd049f62ecd052d577beb0d8d24097a66a9ad))
## [0.40.2](https://github.com/bcgov/platform-services-registry/compare/v0.40.1...v0.40.2) (2024-11-21)

### Bug Fixes

* **4294:** fix the issue setting temporary product by admin ([4a59596](https://github.com/bcgov/platform-services-registry/commit/4a59596d991eca990fb98f4b2eae2598cf829ee4))
## [0.40.1](https://github.com/bcgov/platform-services-registry/compare/v0.40.0...v0.40.1) (2024-11-20)

### Features

* **3197:** enhance popup notifications ([65c8886](https://github.com/bcgov/platform-services-registry/commit/65c8886dc1ac3ca0a648e9428ef3f367c0a849d1))
* **3972:** add admin users page ([3917556](https://github.com/bcgov/platform-services-registry/commit/39175564fef9f12f4199cef6151117158298eaac))
* **4250:** send MailChimp emails to subscriber role members ([ee94fad](https://github.com/bcgov/platform-services-registry/commit/ee94fadf9b8da8dff45d8e319b81b0253c89426d))
* **4284:** auto-approve initial temporary product requests ([c7231b1](https://github.com/bcgov/platform-services-registry/commit/c7231b1ae74d4812e96771ff2ccadefc738b5b55))

### End-to-end Testing

* **4259:** adapt tests to new components and refactor delete test ([ad7daf1](https://github.com/bcgov/platform-services-registry/commit/ad7daf1e2dfc752997ab4d7da5b97c5066cb097b))
## [0.40.0](https://github.com/bcgov/platform-services-registry/compare/v0.39.2...v0.40.0) (2024-11-15)

### Features

* **3097:** add additional product members in private cloud ([e314d6d](https://github.com/bcgov/platform-services-registry/commit/e314d6d650f0431ddc021e966bf0bfea1afa774d))
* **3314:** enforce distinct idir for PO and TL ([a92b0bd](https://github.com/bcgov/platform-services-registry/commit/a92b0bdb3e0a970feb881dd6c8639a4fb3f58b04))
* **4123:** add additional product members in public cloud ([39f5865](https://github.com/bcgov/platform-services-registry/commit/39f586558d1afbc07f28489592392a78acf7815b))
* **4123:** include member changes in public cloud emails ([fde9253](https://github.com/bcgov/platform-services-registry/commit/fde9253d76d1ad40372a146cc849320197d67bfb))
* **4215:** update private cloud Nats message ([f41fb2f](https://github.com/bcgov/platform-services-registry/commit/f41fb2feb0e3c76c9d29065297f45bb1678e6ec7))
* **4221:** use different view for disabled multi-select ([2a70608](https://github.com/bcgov/platform-services-registry/commit/2a70608ee83d9293f8ab64d52eb501002d92c43e))
* **4229:** add generic dollar inputs ([611028a](https://github.com/bcgov/platform-services-registry/commit/611028a747a669ee06e42ce32963a77b366e537b))

### Bug Fixes

* **4196:** resolve issues with react-email/render version ugrade ([adcf70d](https://github.com/bcgov/platform-services-registry/commit/adcf70d498d6a65023519541fea03f2d15529305))

### Docs

* **cd:** add debug deployments guide ([b66110c](https://github.com/bcgov/platform-services-registry/commit/b66110c335e3dba8657066228fafbe2154455f69))
* update Helm deployment failure debug doc ([8f79060](https://github.com/bcgov/platform-services-registry/commit/8f790603331310ed0188effb45b760225565ff6b))

### Refactors

* **4208:** replace classNames with clsx ([3bf622b](https://github.com/bcgov/platform-services-registry/commit/3bf622ba9fe6e39eedfd196573ca8fc969599e46))
* **4212:** add private cloud prefix to MOU tasks ([85fa535](https://github.com/bcgov/platform-services-registry/commit/85fa5353f10f2e335f629d0bc583781e85860359))
* **4227:** replace textarea and multi-select with common components ([d60eb1a](https://github.com/bcgov/platform-services-registry/commit/d60eb1ade77dff959716f8442341156a67aee376))
* **4229:** replace input and with common components ([307da03](https://github.com/bcgov/platform-services-registry/commit/307da034b8b6be510c8580133915d9c8559e8b97))
* **4242:** replace button and with common components ([f2517f8](https://github.com/bcgov/platform-services-registry/commit/f2517f8ce1f24577e52f84d7fe6103f862a0454f))
## [0.39.2](https://github.com/bcgov/platform-services-registry/compare/v0.39.1...v0.39.2) (2024-11-06)

### Bug Fixes

* **4123:** grant view permission of create requests to admins ([72540b3](https://github.com/bcgov/platform-services-registry/commit/72540b34a452edb84ec5d42e4ec1a313b2fa253c))
## [0.39.1](https://github.com/bcgov/platform-services-registry/compare/v0.39.0...v0.39.1) (2024-11-06)

### Features

* **4156:** add user search reusable picker modal ([e3e49b0](https://github.com/bcgov/platform-services-registry/commit/e3e49b06fac4ca9cabe5e74b429cc72bc6df73eb))

### Bug Fixes

* **4165:** replace generic select with dropdown for cluster ([5e7650b](https://github.com/bcgov/platform-services-registry/commit/5e7650b746170d9ce5d1969e054f49ec07d2c94b))
## [0.39.0](https://github.com/bcgov/platform-services-registry/compare/v0.38.0...v0.39.0) (2024-11-04)

### Features

* **1920:** secure provisioner callback URLs ([b119b7a](https://github.com/bcgov/platform-services-registry/commit/b119b7a44ce88719646b85e58172f6b848f5d91a))

### Bug Fixes

* **4110:** hide quota change information section when reviewing ([30640ff](https://github.com/bcgov/platform-services-registry/commit/30640ff06336540cd8886cbd1aeaf9495c819d08))
* **4110:** remove quota change information section from decision page ([5876879](https://github.com/bcgov/platform-services-registry/commit/5876879a1d17055dca9982f28facf30a0b8fcec3))
## [0.38.0](https://github.com/bcgov/platform-services-registry/compare/v0.37.2...v0.38.0) (2024-10-30)

### Features

* **2692:** scan image builds for vulnerabilities ([507e753](https://github.com/bcgov/platform-services-registry/commit/507e753af62f960459e111c2e62230e5ae0012b3))
* **3812:** tweak edit private cloud test to run in github actions and new UI ([4a6d3b4](https://github.com/bcgov/platform-services-registry/commit/4a6d3b47701bfce5e6dd38a2bb4185c23db29268))
* **3813:** add storage data to UI and auto approval check ([083a7e4](https://github.com/bcgov/platform-services-registry/commit/083a7e401a14077eba2c7ce99eafd9f61eef994a))
* **3989:** tweak e2e create private and public cloud tests for new UI ([e5f4379](https://github.com/bcgov/platform-services-registry/commit/e5f4379f57561746c4c992b146e09e9a1a546162))
* **4121:** change tests to correspond to new modal component ([419db65](https://github.com/bcgov/platform-services-registry/commit/419db65d3f3c1d0aa8ec1c741cb606ae6a031db9))

### Bug Fixes

* **2692:** edit image url ([6388060](https://github.com/bcgov/platform-services-registry/commit/6388060c116d9420be022a46c2f2da04cf18d225))

### Docs

* add resource metrics setup ([2d85fc4](https://github.com/bcgov/platform-services-registry/commit/2d85fc44de00c52ccfb82cd667cf3a629ced2ca5))

### Refactors

* **3791:** simply the usage of common modal components ([57c17c2](https://github.com/bcgov/platform-services-registry/commit/57c17c299350dc750aa772ca5586e05ce729e6b7))
* **4055:** replace create request submit modals ([7ca93c4](https://github.com/bcgov/platform-services-registry/commit/7ca93c4437aa31be14480ff9e4ced9a106c5c173))
* **4055:** replace notification & confirmation modals ([68b82f4](https://github.com/bcgov/platform-services-registry/commit/68b82f4e8e6840abe59b0ab2402e4465c4a60251))
* **4055:** replace product delete modals ([6c7c439](https://github.com/bcgov/platform-services-registry/commit/6c7c439ce720dd7398569df099dac33fe14e5ab7))
* **4055:** replace request edit submit modals ([1ab556b](https://github.com/bcgov/platform-services-registry/commit/1ab556b28263183ab2acc93e31ee895ab4cf26de))
* **4055:** replace review modals ([0447eee](https://github.com/bcgov/platform-services-registry/commit/0447eee856e6d759f8bd3e8733cac731327090d6))
* **4076:** upgrade Next.js to version 15 ([2f3d7a1](https://github.com/bcgov/platform-services-registry/commit/2f3d7a169af9337c99e3a812cb3b7b871c5fd18a))
## [0.37.2](https://github.com/bcgov/platform-services-registry/compare/v0.37.1...v0.37.2) (2024-10-22)
## [0.37.1](https://github.com/bcgov/platform-services-registry/compare/v0.37.0...v0.37.1) (2024-10-21)

### Features

* **4018:** add side panel for assigned tasks ([63568c4](https://github.com/bcgov/platform-services-registry/commit/63568c4c6482134836ec60656fd77fdd6695c5a1))

### Docs

* **2692:** compare docker image scanning tools ([e03d3f8](https://github.com/bcgov/platform-services-registry/commit/e03d3f87fc793459d95b36fa0acea62cff554bc8))
## [0.37.0](https://github.com/bcgov/platform-services-registry/compare/v0.36.1...v0.37.0) (2024-10-17)

### Features

* **3118:** lint commit messages locally and in CI ([ccf0962](https://github.com/bcgov/platform-services-registry/commit/ccf09621465776713d4c9bc3c9d682ab59f0b5f1))
* **3365:** update common language to sentence case ([e9d9bcf](https://github.com/bcgov/platform-services-registry/commit/e9d9bcf416e9e510d57458aa0dcc0c3dc3ca0cae))
* **3792:** add reviewer roles and deprecate admin emails ([09ce342](https://github.com/bcgov/platform-services-registry/commit/09ce342992c193a4cb9e44c0c6541ad5d697d41f))
* **3794:** enhance rocket.chat notifications for deployment statuses ([e54f1d5](https://github.com/bcgov/platform-services-registry/commit/e54f1d5d73fb5f6ef1b0be5a429be9c3627c0754))
* **3936:** add create, update methods into session models ([bbf3ad4](https://github.com/bcgov/platform-services-registry/commit/bbf3ad4023dfbb3a756ea2d4a34ca0734acbbb71))
* **3937:** add a billing reader role ([4378684](https://github.com/bcgov/platform-services-registry/commit/43786845a913876ef4d8bb999991da17c94c7a31))
* **3954:** send rocketchat alerts when airflow tasks fail ([334e0de](https://github.com/bcgov/platform-services-registry/commit/334e0de12644ef8640bb244c11bfcbb83cc75748))
* **3966:** add empty quota option and update backend logic ([5c1d4b5](https://github.com/bcgov/platform-services-registry/commit/5c1d4b519f482eab29701924d5388858c67d7bca))

### Bug Fixes

* **4005:** set createdByEmail field optional ([8dbe5df](https://github.com/bcgov/platform-services-registry/commit/8dbe5dfbe43f26f172b4a9f30384559e144537be))

### Refactors

* **3792:** replace string roles to GlobalRole enum object values ([ced9b80](https://github.com/bcgov/platform-services-registry/commit/ced9b80e380e833dab093059f77929247bf68ee7))
* **3936:** add DB services for available entities ([1b8b787](https://github.com/bcgov/platform-services-registry/commit/1b8b787ee4620a1ea7af18d72537ba526cfce32c))
* **3936:** move database helper functions into DB service ([34db605](https://github.com/bcgov/platform-services-registry/commit/34db60557563f2f105810ac51ae418e63848319f))
* **3966:** cleanup resource types ([78104f1](https://github.com/bcgov/platform-services-registry/commit/78104f17ec204f3e3bf19dceeb6b3ee42c61be7c))
## [0.36.1](https://github.com/bcgov/platform-services-registry/compare/v0.36.0...v0.36.1) (2024-10-09)

### Bug Fixes

* **replace-broken-link:** correct link for quota increase request process ([d8ca544](https://github.com/bcgov/platform-services-registry/commit/d8ca544ba9c2dc7f5ce701d47e6cafbf9589ad31))

### Refactors

* **3936:** add DB services for products and requests ([6a7ec96](https://github.com/bcgov/platform-services-registry/commit/6a7ec96fcd47974393aacc399c24c2990b56c9b1))
## [0.36.0](https://github.com/bcgov/platform-services-registry/compare/v0.35.0...v0.36.0) (2024-10-08)

### Features

* **1008:** update Golddr provisioning workflow to receive two callbacks ([e69669e](https://github.com/bcgov/platform-services-registry/commit/e69669edc7c4727a82564debe323071cc5644fa2))
* **3361:** display context in the application header ([16c3ba7](https://github.com/bcgov/platform-services-registry/commit/16c3ba7f1f2b84d4e2b5805d59e9d96fd7900737))
* **3730:** add ministry, cluster and provider for sorting capas ([dd7cd42](https://github.com/bcgov/platform-services-registry/commit/dd7cd42d278833f0f8d08a47f594ed485839b370))
* **3925:** use progress design in request list pages ([25aa1a4](https://github.com/bcgov/platform-services-registry/commit/25aa1a43f7c67b9d4f39bc443245e8ab3d6dfa79))
* **eMOU:** give temporary permission to public document as EA ([2c091c7](https://github.com/bcgov/platform-services-registry/commit/2c091c788ad34e4c4bc835b81d1dea2f27c61916))
## [0.35.0](https://github.com/bcgov/platform-services-registry/compare/v0.34.3...v0.35.0) (2024-10-03)

### Features

* **2827:** add generic text input components ([14bcbb7](https://github.com/bcgov/platform-services-registry/commit/14bcbb7a48cb16987a44b8889ea377fba8f01bda))
* **2827:** add HookFormMultiSelect ([499d55d](https://github.com/bcgov/platform-services-registry/commit/499d55d20894c34dad9ed8f78e3a3f3d30cfc5aa))
* **2828:** add generic textarea components ([08e9d02](https://github.com/bcgov/platform-services-registry/commit/08e9d02d6e94a2105b3f67da3fbb17b379ee1de6))
* **3165:** enhance search, filter, and sort on private products ([a94f71f](https://github.com/bcgov/platform-services-registry/commit/a94f71f218b910472a0ee695daccdb091fb8e458))
* **3166:** enhance search, filter, and sort on private requests ([dc40523](https://github.com/bcgov/platform-services-registry/commit/dc40523437ecb123f52b59015123ab85533da8d6))
* **3167:** enhance search, filter, and sort on private cloud pages ([f03a703](https://github.com/bcgov/platform-services-registry/commit/f03a7034e75de5cc5514206d000dd896d5d72140))
* **3635:** add backend logic for quota auto-approval ([62e3448](https://github.com/bcgov/platform-services-registry/commit/62e3448e951565600d354bde3a799f15a5cdb084))
* **3635:** store quota resource detail in request doc ([7199058](https://github.com/bcgov/platform-services-registry/commit/7199058432ef21d6ece3aa561ab14eea5e076a27))
* **3636:** track reasons for selecting cloud provider ([fbedcc1](https://github.com/bcgov/platform-services-registry/commit/fbedcc16de0680252b30f9025197b5d26b24456c))
* **3637:** display quota change status in UI ([8710f1b](https://github.com/bcgov/platform-services-registry/commit/8710f1bad0763deac71b670f139efd82a03076b4))
* **3637:** send admin email for quota auto-approval ([2621f07](https://github.com/bcgov/platform-services-registry/commit/2621f07d994dcda86fc4838c48192b318564dbd0))
* **3849:** add a new public cloud provider AWS-LZA ([7750548](https://github.com/bcgov/platform-services-registry/commit/775054824a6c6b471f31a296ec1a6331b0ca9536))

### Bug Fixes

* **3872:** update headers on products/requests pages ([4e405cc](https://github.com/bcgov/platform-services-registry/commit/4e405cc77c64bb134183e6af1aec6f6d6dc8dfa3))
* **mailchimp:** wait for batch operation to complete before starting next ([691ebe2](https://github.com/bcgov/platform-services-registry/commit/691ebe21d3c06e0fdbc15472fcc14f0089da334c))
## [0.34.3](https://github.com/bcgov/platform-services-registry/compare/v0.34.2...v0.34.3) (2024-09-27)

### Bug Fixes

* pass licence plates into proper field ([48eea32](https://github.com/bcgov/platform-services-registry/commit/48eea32a8edf2d7002463156917486704b00c8e6))
## [0.34.2](https://github.com/bcgov/platform-services-registry/compare/v0.34.0...v0.34.2) (2024-09-24)

### Features

* **3165:** add label and select generic components ([27e2187](https://github.com/bcgov/platform-services-registry/commit/27e218782427c8f1527d229a652adb55bc1b1d3c))
* **3364-3361:** hightlight changes to quota and reorder namespaces ([b6d447d](https://github.com/bcgov/platform-services-registry/commit/b6d447deb45cfac90dabfdb820e6656f3fa05973))
* **3471:** add usage metrics for namespaces pods ([ebed667](https://github.com/bcgov/platform-services-registry/commit/ebed6673955e6efb9154457ae3d856a661da8954))
* **3593-2:** add 'Completed' email template and trigger on edit request completed; update Approved email template ([830bc12](https://github.com/bcgov/platform-services-registry/commit/830bc12fa6ae20f341c12c511712335b2f159a80))
* **3593-2:** adjust email templates for provisioning and editing products ([c28d189](https://github.com/bcgov/platform-services-registry/commit/c28d18973c86bc1f868a1721e454320a13608869))
* **3593-3:** update mermaid diagram ([4cfdbdc](https://github.com/bcgov/platform-services-registry/commit/4cfdbdc3a6c85e49fb471927f6addeaa78f1b3ab))
* **3593:** modify approval email templates and triggers. ([4a65e3f](https://github.com/bcgov/platform-services-registry/commit/4a65e3f9d6ee86f0de15e2efaec5e11e2ba7eb68))
* **3593:** modify request approval email templates and triggers ([e59b808](https://github.com/bcgov/platform-services-registry/commit/e59b80831254c0309cfe517b0482274ae115c0bc))
* **3647:** add saving screenshots, tweak e2e tests and sandbox image pulls ([bb9faa1](https://github.com/bcgov/platform-services-registry/commit/bb9faa14ce87f14ba20b195765edcb04693682c6))
* **3663:** add graphic for when there are no comments to display ([296c19e](https://github.com/bcgov/platform-services-registry/commit/296c19e2ec24747c03eb203435fde07c8adf77a7))
* **3669:** enhance eMOU workflow ([286f486](https://github.com/bcgov/platform-services-registry/commit/286f486c8cecbabcecd37cf7725d9afc81bde673))
* **3697:** add separate billing code by providers ([9e117aa](https://github.com/bcgov/platform-services-registry/commit/9e117aaa2181ca48e17a40a03f86f8af76310ae9))
* **3717:** add an admin script to resend eMOU signing emails ([1b7f909](https://github.com/bcgov/platform-services-registry/commit/1b7f909cde83ac07e55ba69c5297609bca4a495f))
* **3814:** tweak public cloud create test to run in github actions ([093dc74](https://github.com/bcgov/platform-services-registry/commit/093dc7490dfcf0dfeda0bd48c41e9b10b16d7530))
* **analytics:** add quota summary CSV endpoint ([71ffed4](https://github.com/bcgov/platform-services-registry/commit/71ffed46210a78dfa1471c7354fc0e3ef5f950b4))

### Bug Fixes

* **3364:** reorder quota namespaces in private cloud ([ef7335c](https://github.com/bcgov/platform-services-registry/commit/ef7335c88c32e5b168e219c086b855953ec85d42))
* **3573:** capitalize CPU in the request summary page ([cf770a7](https://github.com/bcgov/platform-services-registry/commit/cf770a7489eb695562d7c12fd57e41b0be0163a8))
* **3642:** update eMOU document for platform name ([83b1a1f](https://github.com/bcgov/platform-services-registry/commit/83b1a1fcadf27a71cd1f920dc6ba4b045c86dd3e))
* **3773:** apply minimum validation for delete request decision ([18248a4](https://github.com/bcgov/platform-services-registry/commit/18248a4a2dcd26a3905636b555f846022860ca3f))
* **3782:** resolve the issue approving edit requests ([9e1da00](https://github.com/bcgov/platform-services-registry/commit/9e1da00bcbac02efb53e5980d6ebc6ea78388ee2))
* **3795:** remove duplicate group names ([1004aaf](https://github.com/bcgov/platform-services-registry/commit/1004aaf12c791c3f9763c3faa1ba14a1416989d2))
* **3795:** update Keycloak role fetching logic ([ddd262e](https://github.com/bcgov/platform-services-registry/commit/ddd262ea168b916b922fab3cfb4da4360e4a4271))

### Refactors

* **3731:** revisit comment sections on email templates ([ceb9cd7](https://github.com/bcgov/platform-services-registry/commit/ceb9cd70ee8f79b30fdaeb375fad2d3d11adb700))
* **3747:** optimize email templates ([c189f41](https://github.com/bcgov/platform-services-registry/commit/c189f41022bbb618bda02ee38f69a3cf84c91389))
* **3747:** organize email templates ([d1ee4ef](https://github.com/bcgov/platform-services-registry/commit/d1ee4efeed94e33b0f04aceca995257b5c2332ac))
* **3747:** organize email templates' types ([a822488](https://github.com/bcgov/platform-services-registry/commit/a8224885a74107dc647854cf20516154b5831682))
* **3747:** update the email template function definitions ([352e8d1](https://github.com/bcgov/platform-services-registry/commit/352e8d1c676a15a222578c92cbaae11554fcfb1c))
## [0.34.0](https://github.com/bcgov/platform-services-registry/compare/v0.33.2...v0.34.0) (2024-09-04)

### Features

* **227:** add accordion components ([67bfc0b](https://github.com/bcgov/platform-services-registry/commit/67bfc0b17698f23e86a1d9f5a048ee7143e10fef))
* **3191:** add admin tooltip and notification ([5dd8d65](https://github.com/bcgov/platform-services-registry/commit/5dd8d65f9b0e5f0f6570bcc472a7d7a3c67b7157))
* **3191:** add admin tooltip and notification ([db54d5a](https://github.com/bcgov/platform-services-registry/commit/db54d5a178d16538ecffe9b0081ad5a1285aa78a))
* **3414:** add eMOU sign & review workflows ([3b1c1dc](https://github.com/bcgov/platform-services-registry/commit/3b1c1dc232d78462946438d1dd2784063e3657e0))
* **3414:** update eMOU PDF content ([5ad8dce](https://github.com/bcgov/platform-services-registry/commit/5ad8dce8e63c04c17fe0a53a1d20a63c13d4e445))
* **3467:** refactor create test for private and public cloud ([ace5c15](https://github.com/bcgov/platform-services-registry/commit/ace5c154d1d063e751edd980cd9f9d7cb8e331d5))
* **3500:** send billing EMOU review request emails ([f853351](https://github.com/bcgov/platform-services-registry/commit/f85335119a29c5b8f5c461aeea6b174fccf3c312))
* **3501:** add eMOU PDF download link ([a1996a9](https://github.com/bcgov/platform-services-registry/commit/a1996a90cd90d3d6e0d0b9f6be744db588eace71))
* **3501:** use WeasyPrint to download PDF ([6610bfe](https://github.com/bcgov/platform-services-registry/commit/6610bfe2f397675b48209edfddbb5f5b8731863b))
* **3576:** include MS AD user object ID into public cloud NATS ([b18cbe7](https://github.com/bcgov/platform-services-registry/commit/b18cbe71ece923167d0c15cc160a56156df0c9e3))
* **3587:** merge steps definition to common file, refactor edit request ([9da9596](https://github.com/bcgov/platform-services-registry/commit/9da9596bc2fdd3cd20170e16cd09834c39ccdf6a))
* **3593-1:** modify create, delete, edit and approve request templates ([6e021a8](https://github.com/bcgov/platform-services-registry/commit/6e021a81482d87c3e3bf17c8cdf9ed96b3501c32))

### Bug Fixes

* **2543:** send approve email for not quota increase edit ([d3ed2d7](https://github.com/bcgov/platform-services-registry/commit/d3ed2d7aa94f7ad963b17e9053aac33d0b6979de))
* **3157:** udpate delete modal UI ([556841d](https://github.com/bcgov/platform-services-registry/commit/556841d381034d3b18b9545bb47a79747cf7e59c))
* **3157:** update delete confirmation modal ([b6994da](https://github.com/bcgov/platform-services-registry/commit/b6994da906ffa9b3db29af1df6a3314274b2bd42))
* **3259:** disable provider dropdown for public cloud product edit page ([0b9704e](https://github.com/bcgov/platform-services-registry/commit/0b9704e5ef573e34e36bb2e55f6318441c1166c2))
* **3511:** fix visual bug mantinie upgrage Budge component styles ([3245017](https://github.com/bcgov/platform-services-registry/commit/324501777c0c693ef693396f5c2029864019f8a3))
* **3641:** resolve a bug displaying multiple app versions in footer ([6c4380c](https://github.com/bcgov/platform-services-registry/commit/6c4380c6411a68d8c47c06e44b81b2a41716ce61))

### Docs

* **3621:** add documentation for onboarding and offboarding ([f841873](https://github.com/bcgov/platform-services-registry/commit/f84187397fd983d2d805d65facaa80f66083c081))
* **3639:** add documentation for rocketchat notifications ([f616cd5](https://github.com/bcgov/platform-services-registry/commit/f616cd5aca8a8b53254dcc47fd46bb291f298277))
* add guidelines for reviewing bot PRs ([9b1832f](https://github.com/bcgov/platform-services-registry/commit/9b1832fc3d596ec42e199e9f14a97f63d54f6983))
* **readme-modified:** update installation instructions ([67b1bad](https://github.com/bcgov/platform-services-registry/commit/67b1badb3f6c474b2e0e03f1bd707356b8a97a84))

### Refactors

* **3610:** organize type definitions ([d569886](https://github.com/bcgov/platform-services-registry/commit/d56988672a90a7af82c087e5463a11329350206b))
* **validation-schema:** organize schema definitions ([b7f7a82](https://github.com/bcgov/platform-services-registry/commit/b7f7a8256c98a96db2ef4da50176d9f320ef5985))
## [0.33.2](https://github.com/bcgov/platform-services-registry/compare/v0.33.1...v0.33.2) (2024-08-15)

### Features

* **2399:** implement code for BDD features, Create, Approve, Delete tests ([0b35e9a](https://github.com/bcgov/platform-services-registry/commit/0b35e9a568295c9a35b01e9dfb7c1f03e4499ac0))
* **3373:** Add Edit Request test and partial refactoring ([b27ccb8](https://github.com/bcgov/platform-services-registry/commit/b27ccb8032ee73c5f6ccf429f877614402cd7a21))
* **3502:** add public eMOU workflow diagram ([af36f3e](https://github.com/bcgov/platform-services-registry/commit/af36f3e51d4d4856db548dc474438f7776dc9208))

### Bug Fixes

* **3526:** Make Team Comments component number dynamic ([4328b76](https://github.com/bcgov/platform-services-registry/commit/4328b7608096765be068ae65feb611dd19071566))
## [0.33.1](https://github.com/bcgov/platform-services-registry/compare/v0.33.0...v0.33.1) (2024-08-07)

### Features

* **3472:** grant public cloud Azure provider access ([6593d35](https://github.com/bcgov/platform-services-registry/commit/6593d3553d333dc2f953aa02e56f9b9bdf002bab))

### Bug Fixes

* **3452:** grant public products review permissions properly ([8feb824](https://github.com/bcgov/platform-services-registry/commit/8feb8247c175a55a0916e9ede4717b7d3b207949))
* **3453:** display temporary badges and alerts ([bdc029b](https://github.com/bcgov/platform-services-registry/commit/bdc029b3fe8e128b131a51a366d491de7995f493))
## [0.33.0](https://github.com/bcgov/platform-services-registry/compare/v0.32.0...v0.33.0) (2024-08-01)

### Features

* **2759:** Add generic button component PoC ([1b872aa](https://github.com/bcgov/platform-services-registry/commit/1b872aafad806e85f6afb56efc28b5e863be6eb1))
* **2759:** add mantine color theme ([c9ff432](https://github.com/bcgov/platform-services-registry/commit/c9ff432e3d1415172ebb8d09c567c6c8a2536f90))
* **2759:** Relocate button ex., use generated colors, looping variants ([d2ae4e0](https://github.com/bcgov/platform-services-registry/commit/d2ae4e0e0eeb3a292d281fa84d85974749f6fb8b))
* **3077:** add Airflow DAG to handle delete requests ([69ae1af](https://github.com/bcgov/platform-services-registry/commit/69ae1af6f09968aaca1cbc4480a9ce60602ed15a))
* **3121:** add backend API endpints to support team service accounts ([c7a7857](https://github.com/bcgov/platform-services-registry/commit/c7a7857e7f48dffac33fa2406c7d96ada7b9728a))
* **3196:** add quota contact & justification inputs ([e38687f](https://github.com/bcgov/platform-services-registry/commit/e38687fccb1df7f8fe56dd3824de05c2d37657aa))
* **3196:** set request box to full width for size consistency ([2e00872](https://github.com/bcgov/platform-services-registry/commit/2e008720fd4db308c2c6006a7f691bbb0d09e06f))
* **3207:** display the number of comments on a request to admins ([5540242](https://github.com/bcgov/platform-services-registry/commit/554024273fb992ed424a063b332d4c9c1c3ab34b))
* **3242:** grant private admin to toggle temporary flags ([9e7ee5a](https://github.com/bcgov/platform-services-registry/commit/9e7ee5aac06389ed2b63f35c86da7b40f33736d7))
* **3242:** save temporary flag instantly when admin updates flag ([84f92dc](https://github.com/bcgov/platform-services-registry/commit/84f92dc3991d5355d76f2f5d4968fe6d69f73f04))
* **3252:** add cronjob to update Registry emails in Mailchimp ([adf68f8](https://github.com/bcgov/platform-services-registry/commit/adf68f8453ff1423bfbf558390452e83a02af98f))
* **3305:** add team API account page and functionalities ([691d5f6](https://github.com/bcgov/platform-services-registry/commit/691d5f6b180cc3505574b5e57a7488a58c021b2c))
* **3320:** add core helper function to create modals ([dff956e](https://github.com/bcgov/platform-services-registry/commit/dff956e6c4fff6851413f23e7ea5b04d1af84e98))
* **3332:** display email errors on the team account form ([4e8b5b0](https://github.com/bcgov/platform-services-registry/commit/4e8b5b04bc5a3e6fa85e0a328de562bb85bedd6e))
* **3332:** update API handler to accept team service account tokens ([8fce615](https://github.com/bcgov/platform-services-registry/commit/8fce61501866ed464eafe6737360e63638f312a1))
* **3372:** install Jinja2 into Airflow for email templating ([392465e](https://github.com/bcgov/platform-services-registry/commit/392465e8a38c082106872fe3290f576c70cce698))
* **3372:** send notifications to temporary products ([29de650](https://github.com/bcgov/platform-services-registry/commit/29de65098a04231b687ddfe0783aa03b3046c4f9))
* **3414:** add task schema and logic to backend ([04e4cfb](https://github.com/bcgov/platform-services-registry/commit/04e4cfb6a839d836804cbc2f8474d55e171b0b6a))

### Bug Fixes

* **3121:** fix typo to retrieve correct roles ([039f0ad](https://github.com/bcgov/platform-services-registry/commit/039f0ade30fed45ee1648b9ba07830d26eda73af))
* **3415:** sync contact dropdown when onBlur ([2515f99](https://github.com/bcgov/platform-services-registry/commit/2515f99a1b0b4396b7091d42f235c4c25a7dd48b))
* **3420:** display temporary product deletion date based on product ([94a5f85](https://github.com/bcgov/platform-services-registry/commit/94a5f85374d9f733cb067ea16d6fb4020bacc19f))
* main branch merge ([5482063](https://github.com/bcgov/platform-services-registry/commit/54820633d4e0d28c1682b0ae6c3679fcbdf70dcc))

### Refactors

* **3369:** add optional comments in request confirmation modals ([8a8961f](https://github.com/bcgov/platform-services-registry/commit/8a8961faadf4daf8191c70abe5d1c9c5bff3e4e3))
## [0.32.0](https://github.com/bcgov/platform-services-registry/compare/v0.31.2...v0.32.0) (2024-07-09)

### Features

* **2847:** check for license plate duplication in DB when creating ([fdc6e84](https://github.com/bcgov/platform-services-registry/commit/fdc6e84687cfdccd68113b62c23cb180f02c6257))
* **2959:** minimal e2e private cloud happy path test set ([ef9432d](https://github.com/bcgov/platform-services-registry/commit/ef9432dcd64f9dbcc48a75dd9444d3d275bca0dd))
* **2961:** add contact changes historical chart ([7869e76](https://github.com/bcgov/platform-services-registry/commit/7869e767f0943b1629bba981bed56314d43e6c70))
* **2961:** enable export options for contact changes chart data ([3e2baa9](https://github.com/bcgov/platform-services-registry/commit/3e2baa930b454c396f2baafd486e8bf8faa7cbfc))
* **2962:** add login event chart in analytics page ([039c9e6](https://github.com/bcgov/platform-services-registry/commit/039c9e6c8bfc57d5b180c264a138ae0412a79514))
* **3220:** update v1 API endpoints data & parameters ([0444e66](https://github.com/bcgov/platform-services-registry/commit/0444e66afc664e995990c1fbb43ff6a1725c182b))
* **3244:** add minimal happy path gherkin scenarios for public cloud request flow ([de5b5af](https://github.com/bcgov/platform-services-registry/commit/de5b5afaecae97c46b75da45726e3b1e15f99df4))
* **3296:** enhance search input clear button behaviour ([c597284](https://github.com/bcgov/platform-services-registry/commit/c597284a8ecf0e4b57a0e171b3328a7495c66eb5))
* add subscription to mlalchimp ([7072ad6](https://github.com/bcgov/platform-services-registry/commit/7072ad65af21ba34819fecedcb04415cf7a07538))
* add support phone number for private products ([c1dfa88](https://github.com/bcgov/platform-services-registry/commit/c1dfa88a968e46123fb564d4dc6b5fb8732789fb))
* add X button to clear search text field ([ffbf59a](https://github.com/bcgov/platform-services-registry/commit/ffbf59a56fefe96052c6c0e3ba8723ef1b641fc7))
## [0.31.2](https://github.com/bcgov/platform-services-registry/compare/v0.31.1...v0.31.2) (2024-06-25)

### Features

* **2961:** store product change metadata in DB ([1af2295](https://github.com/bcgov/platform-services-registry/commit/1af2295f4dd884057ce0aacfbcbaad05aa0f2e0a))

### Bug Fixes

* **3215:** correct the roles for product comments to add private admin ([0f10486](https://github.com/bcgov/platform-services-registry/commit/0f10486a501423de2473d0e1533aa75272a94a80))
## [0.31.1](https://github.com/bcgov/platform-services-registry/compare/v0.31.0...v0.31.1) (2024-06-25)

### Features

* **2961:** add a Make command to copy data from live environment ([901ba03](https://github.com/bcgov/platform-services-registry/commit/901ba03268eca72b00800a6b0622d0e034fbbc7e))
* **3145:** integrate the provisioner script into Airflow DAGs ([617d805](https://github.com/bcgov/platform-services-registry/commit/617d805d4f4fe95627946ebd1ed466ca714c4935))
* **3179:** add rich text editor to admin comments pages ([68691d9](https://github.com/bcgov/platform-services-registry/commit/68691d9cc149654ecd07a53c4d1e7980a06addc7))
## [0.31.0](https://github.com/bcgov/platform-services-registry/compare/v0.30.0...v0.31.0) (2024-06-24)

### Features

* **3034:** hide current resource info on non-editable form ([e85ef64](https://github.com/bcgov/platform-services-registry/commit/e85ef648eeda12c97d5aa6367189c6cb20e31864))
* **3046:** add API test script for private cloud product download ([5578c03](https://github.com/bcgov/platform-services-registry/commit/5578c0389f70fec4bc3ad1dc071c6f19bbcf45b7))
* **3046:** add API test script for private cloud product requests ([80e50d2](https://github.com/bcgov/platform-services-registry/commit/80e50d20a9147d7f4c1b3202910975bb0f97ea1a))
* **3047:** add API test scripts for public cloud routes ([a77fc65](https://github.com/bcgov/platform-services-registry/commit/a77fc65240650f5832ce4acfb8d95acdcbad9ec8))
* **3048:** add API test scripts for user service account endpoints ([be31521](https://github.com/bcgov/platform-services-registry/commit/be31521db0e7e582cde36ddc3f9fc050a291e85d))
* **3094:** display request box in public product table list ([0005186](https://github.com/bcgov/platform-services-registry/commit/00051868d993976f9d6ffb12a3c50ccba5ac3024))
* **provisioner:** add backend logic to backup provisioner callback (remove 'completed' attribute) ([dce3c8e](https://github.com/bcgov/platform-services-registry/commit/dce3c8ec4ed5660bb13810d3302dd82516309935))

### Bug Fixes

* **2889:** update data diff common function ([c4c48e0](https://github.com/bcgov/platform-services-registry/commit/c4c48e0f5945a585d1c8f0ee03c77f9b8aad3cc6))
* **2977:** update private cloud reject email to cover create request ([f8dc841](https://github.com/bcgov/platform-services-registry/commit/f8dc84195e240e8fd0b5961204cbbfb849589b8b))
* **3093:** add word wrap and character limit to description tool tips ([6b37fc2](https://github.com/bcgov/platform-services-registry/commit/6b37fc26d3464583f125c487a163e656ce3bec97))
* **3103:** give explicit view permission to ministry editor ([d5fe609](https://github.com/bcgov/platform-services-registry/commit/d5fe60946333454e3354e689c2d9a8f426a60971))
* **3174:** fix newlines in edit text area and refetching of edited comments ([33e68cf](https://github.com/bcgov/platform-services-registry/commit/33e68cf06d56c750841494ba116d3566a8850f11))
* show only requested environments budget ([32adb92](https://github.com/bcgov/platform-services-registry/commit/32adb92eea296a69911a2a39a27eb712c2c90d20))

### Refactors

* update landing page content ([193b33d](https://github.com/bcgov/platform-services-registry/commit/193b33d7ef62f04f5c637090fbdaefcb004389f1))
## [0.30.0](https://github.com/bcgov/platform-services-registry/compare/v0.29.1...v0.30.0) (2024-06-17)

### Features

* **3042:** add api token create & delete events ([7d5713e](https://github.com/bcgov/platform-services-registry/commit/7d5713e4fbb19877a04dbfacb03a7085f44ae3e1))
* **3042:** add event schema ([942bcac](https://github.com/bcgov/platform-services-registry/commit/942bcace8a8215d3bed2534bc9757c6dea0d6960))
* **3042:** add events on storing export products ([4c4684f](https://github.com/bcgov/platform-services-registry/commit/4c4684f0686ef407e621404781ec4c7085e22e36))
* **3042:** add login & logout events ([2c7fce4](https://github.com/bcgov/platform-services-registry/commit/2c7fce40f57cd9dd404a2e1b1d18ee5a83450d05))
* **3042:** add private & public request events ([86832d6](https://github.com/bcgov/platform-services-registry/commit/86832d646d5e308702dd74ddd398eb1cbfe472a5))
* **3042:** add private & public review events ([1fabe27](https://github.com/bcgov/platform-services-registry/commit/1fabe27df2ed636d4f8e8ccf821d6951cfabf2fe))
* **3042:** keep track of the last active datetime ([cd37498](https://github.com/bcgov/platform-services-registry/commit/cd37498091907d9d17edb730b367c20795679128))
* **3046:** add API test script for private cloud product search endpoint ([7456d80](https://github.com/bcgov/platform-services-registry/commit/7456d80e514996ae4a9452a3af82cde30b694fda))
* **3046:** add API test script for private cloud request search endpoint ([633660c](https://github.com/bcgov/platform-services-registry/commit/633660ce8f30ec34e3d67c565839898cffd41e87))
## [0.29.1](https://github.com/bcgov/platform-services-registry/compare/v0.29.0...v0.29.1) (2024-06-10)

### Features

* **3045:** add a func to create sample private cloud data ([3eab36d](https://github.com/bcgov/platform-services-registry/commit/3eab36d44334e3af9fde6a625d0edee844e17540))

### Bug Fixes

* **3061:** display cloud calculator correctly ([136ad72](https://github.com/bcgov/platform-services-registry/commit/136ad7286e66376152a570bb4d4e09bcd24c867b))
## [0.29.0](https://github.com/bcgov/platform-services-registry/compare/v0.28.0...v0.29.0) (2024-06-07)

### Features

* **3045:** encapsulate Next.js routes with parameters for reusability ([9153999](https://github.com/bcgov/platform-services-registry/commit/915399940ec23bf8b82af68f17214f7570b19c4e))

### Bug Fixes

* **3052:** add missing private cloud create requests ([fd8f9ba](https://github.com/bcgov/platform-services-registry/commit/fd8f9baa0bb90d5d30d077491b038f8e5ec8b17a))
## [0.28.0](https://github.com/bcgov/platform-services-registry/compare/v0.27.0...v0.28.0) (2024-06-05)

### Features

* **3001:** add service API endpoint to accept both ID and license plate ([6e7446f](https://github.com/bcgov/platform-services-registry/commit/6e7446f40e190ba37916167d512326f3c1cb5d8b))
## [0.27.0](https://github.com/bcgov/platform-services-registry/compare/v0.26.5...v0.27.0) (2024-06-05)

### Features

* **2808:** create Keycloak groups for AWS requests ([9d16fa7](https://github.com/bcgov/platform-services-registry/commit/9d16fa7652a779f2b1645b0eee8c869caf594935))
* **2958:** add frontend support for admin comments on requests ([8f6634f](https://github.com/bcgov/platform-services-registry/commit/8f6634f388f7a71c03cbc64882b40349a5469ee4))
* add all ministry specific roles ([e676af4](https://github.com/bcgov/platform-services-registry/commit/e676af43133ddc08813d23c035a6c057f8151674))

### Bug Fixes

* **2726:** add error handling and notifications for unauthorized product creation ([31a1979](https://github.com/bcgov/platform-services-registry/commit/31a1979c06f3fefef99be8db022cfad71e15cb71))

### Refactors

* **2596:** convert nats-provision into typescript ([2e5f1d1](https://github.com/bcgov/platform-services-registry/commit/2e5f1d120602b4890516d02dee2768422dbce708))
* **2808:** move Keycloak admin core as the common package ([7f88cd9](https://github.com/bcgov/platform-services-registry/commit/7f88cd9dac6f46203bac988b9cda44713df286b9))
* **2826:** deprecate react toastify and replace with mantine notifications ([156fbc1](https://github.com/bcgov/platform-services-registry/commit/156fbc18b5ac7648885e968db45a29fae47822a6))
## [0.26.5](https://github.com/bcgov/platform-services-registry/compare/v0.26.4...v0.26.5) (2024-06-04)

### Features

* **2596:** add Azure as the second public cloud provider option ([1409f5e](https://github.com/bcgov/platform-services-registry/commit/1409f5e651c623c14a5b23a49d6fb4c04a226ac9))
* **2596:** add Azure provider into public analystics dashboard ([9b6c628](https://github.com/bcgov/platform-services-registry/commit/9b6c6286f6266d559334e56c31a7e8732d97310d))

### Refactors

* **2808:** convert keycloak provision into typescript ([a546710](https://github.com/bcgov/platform-services-registry/commit/a546710fa7f08665aa2a210f5ad670fa47b2fee9))
## [0.26.4](https://github.com/bcgov/platform-services-registry/compare/v0.26.3...v0.26.4) (2024-06-03)

### Features

* **2914:** add provisioned date in request schemas ([dddd423](https://github.com/bcgov/platform-services-registry/commit/dddd423eff2969d70ad1e6c2dc8b31cc677fb77f))
* label for private product and request dashboards, is test filter for private requests ([59d8315](https://github.com/bcgov/platform-services-registry/commit/59d8315e603958f78782140bed50f0904c3ded7d))

### Bug Fixes

* run build error with no isTest for public cloud products ([e20f903](https://github.com/bcgov/platform-services-registry/commit/e20f903ccf3c6603f1738718f53f6a8d0372772b))

### Refactors

* **2032:** move security dashboard to root directory ([3f969f8](https://github.com/bcgov/platform-services-registry/commit/3f969f82f92b401ccfe7d0c84ff378141189cc20))
* **2404:** move service account verification logic into core ([288d0c6](https://github.com/bcgov/platform-services-registry/commit/288d0c6d13ed1550bc7083e416a06c94c245aff8))
* **2832:** rename created to created in request schemas ([051a8ac](https://github.com/bcgov/platform-services-registry/commit/051a8ac4da15d641654d8ff7f065d7e32194a2d9))
## [0.26.3](https://github.com/bcgov/platform-services-registry/compare/v0.26.2...v0.26.3) (2024-05-30)
## [0.26.2](https://github.com/bcgov/platform-services-registry/compare/v0.26.1...v0.26.2) (2024-05-30)
## [0.26.1](https://github.com/bcgov/platform-services-registry/compare/v0.26.0...v0.26.1) (2024-05-29)

### Bug Fixes

* **2844:** fix private cloud email bugs ([5f84b79](https://github.com/bcgov/platform-services-registry/commit/5f84b792ae34f8d59014f4f43d7690a6f9ddcfc1))

### Refactors

* **2832:** enable app eslint in pre-commit ([c8f753f](https://github.com/bcgov/platform-services-registry/commit/c8f753f4fc19b3ad426ac2d94b28fce984b75ff0))
* **2832:** move application codebase to app directory ([7f86231](https://github.com/bcgov/platform-services-registry/commit/7f86231e2ff4983b4bc0baea1c7c3e84fa11fd50))
* **ci:** separate build and test jobs for performance gain ([771b05b](https://github.com/bcgov/platform-services-registry/commit/771b05b0eef30a3052cfbc9a862cd4c5953fd492))
## [0.26.0](https://github.com/bcgov/platform-services-registry/compare/v0.25.0...v0.26.0) (2024-05-28)

### Features

* add test label, filtering, days until product deletion ([f8af1a8](https://github.com/bcgov/platform-services-registry/commit/f8af1a807aef73491c538b3bfa4a4344a7708d6e))
* **ui:** update header menu design ([c5a281f](https://github.com/bcgov/platform-services-registry/commit/c5a281f0824714cc3df6d520ee41c69a218f2178))

### Refactors

* **2778:** clean up icons ([09eba1e](https://github.com/bcgov/platform-services-registry/commit/09eba1e6d6120afa9999538ec058c3384117bb9f))
## [0.25.0](https://github.com/bcgov/platform-services-registry/compare/v0.24.6...v0.25.0) (2024-05-27)

### Features

* **2597:** add accounts section in public product page ([7a3815a](https://github.com/bcgov/platform-services-registry/commit/7a3815aa4ce378b16ef407ec9e872fa27a3bda5e))
* **2842:** add support for comments on request entity ([622e50a](https://github.com/bcgov/platform-services-registry/commit/622e50aa8735602c56fd8daa853e118d20bc61b4))
## [0.24.6](https://github.com/bcgov/platform-services-registry/compare/v0.24.4...v0.24.6) (2024-05-27)

### Features

* **2404:** add api account page with initial api endpoints ([ef7a74d](https://github.com/bcgov/platform-services-registry/commit/ef7a74d998b993ef46f59f94cb16837b3136e4f8))
* **2404:** create admin cli to manage api accounts via keycloak ([dc007e2](https://github.com/bcgov/platform-services-registry/commit/dc007e2ae8848353441d61c5ec8a86c06f2e4412))
* add isTest flag to private cloud product ([10e4b76](https://github.com/bcgov/platform-services-registry/commit/10e4b76ad8c5d646505daa5861c1a9e72f5aba78))
* add isTest flag to private cloud product ([5f3abb7](https://github.com/bcgov/platform-services-registry/commit/5f3abb707513629d1f99ef955895540b5e6d56de))
* add isTest flag to private cloud product and script add isTest field ([bfcfd77](https://github.com/bcgov/platform-services-registry/commit/bfcfd773ec890b1d53c2ab78330b8ab3df324874))
* update api account endpoint spec & doc ([29cdfbc](https://github.com/bcgov/platform-services-registry/commit/29cdfbc5cac74e1e8e2395258547066b79cbe8be))

### Bug Fixes

* display comments for admin only ([074fbe2](https://github.com/bcgov/platform-services-registry/commit/074fbe2eb4361bacb4a47f0ae322e220a14b894f))

### Refactors

* increase the request list fetch performance ([e2c815b](https://github.com/bcgov/platform-services-registry/commit/e2c815b849a20909f9b64e0a65063e576ba7b03c))
## [0.24.4](https://github.com/bcgov/platform-services-registry/compare/v0.24.3...v0.24.4) (2024-05-23)

### Bug Fixes

* check the provision status for create requests ([63b49fa](https://github.com/bcgov/platform-services-registry/commit/63b49faf3c93a5dc249719b70b257e4232ed230b))
## [0.24.3](https://github.com/bcgov/platform-services-registry/compare/v0.24.2...v0.24.3) (2024-05-23)
## [0.24.2](https://github.com/bcgov/platform-services-registry/compare/v0.24.1...v0.24.2) (2024-05-22)
## [0.24.1](https://github.com/bcgov/platform-services-registry/compare/v0.24.0...v0.24.1) (2024-05-21)

### Features

* display form errors via notifications ([cb25e36](https://github.com/bcgov/platform-services-registry/commit/cb25e36ed813dcc7dcc3a3de73e0ad3ccf130894))
## [0.24.0](https://github.com/bcgov/platform-services-registry/compare/v0.23.8...v0.24.0) (2024-05-21)

### Features

* **2309:** add home page ([2fbea77](https://github.com/bcgov/platform-services-registry/commit/2fbea778f7edb0681abe7175f6fdbfc3cd7e9bdf))
* **2698:** add an api endpoint to list all license plates ([3e13d88](https://github.com/bcgov/platform-services-registry/commit/3e13d8874b3ec7cb40964644c77a5e3f2393c684))
* add a common component CopyableButton ([4084eab](https://github.com/bcgov/platform-services-registry/commit/4084eabafa90fd45ca6b90fb3526233305857d0b))
* add a data migration script to populate update date ([3cd6458](https://github.com/bcgov/platform-services-registry/commit/3cd6458cea2f31566bb09abdb2211ef5962e2dff))
* add confirmation in checkbox component ([4c51117](https://github.com/bcgov/platform-services-registry/commit/4c511172d407a5856e825a9e6b9f55e84be7c34c))
* **ci-cd:** add RocketChat notification for successful prod deployment ([3353c86](https://github.com/bcgov/platform-services-registry/commit/3353c865e77a834beb8012a38262371fb175e08f))
* display product change table in request summary tabs ([bf383fb](https://github.com/bcgov/platform-services-registry/commit/bf383fb7b259b715fbe6792fca25c0c10cf14318))
* expand request pages ([0394b39](https://github.com/bcgov/platform-services-registry/commit/0394b3918f392d670ac26f80e018f19d37130b08))
* update dashboard top sections ([715dd72](https://github.com/bcgov/platform-services-registry/commit/715dd7278e6ff4f31cd6c91ad75a2d0f8ed9b068))
* use mail link in user card ([6cca8ef](https://github.com/bcgov/platform-services-registry/commit/6cca8ef8a3f7820038d514417d2d5e44a896f526))

### Bug Fixes

* **2813:** add dynamic numbering to Common Components section ([f124f60](https://github.com/bcgov/platform-services-registry/commit/f124f60cd30541b941a012a3b591a94939cbf3ee))
* **2835:** add dynamic wording for gold dr check box ([c996027](https://github.com/bcgov/platform-services-registry/commit/c99602704919576138d2933b511262f627fa9df8))
* display goto product link properly ([18f400b](https://github.com/bcgov/platform-services-registry/commit/18f400b0b7ad9c15f814b17c098042ad5198b46a))

### Refactors

* **2793:** cleanup table body components ([19c5706](https://github.com/bcgov/platform-services-registry/commit/19c5706b8c5f0fdd398a910e64bd8abff3f3f9be))
* organize tabs and data changes ([b46834b](https://github.com/bcgov/platform-services-registry/commit/b46834bd85c605ad302209b335b1437f1809301b))
* secure api endpoints with doc permissions ([5542b1f](https://github.com/bcgov/platform-services-registry/commit/5542b1fc13c0662abfdbd2354f3bf07797fecb4f))
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
