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

