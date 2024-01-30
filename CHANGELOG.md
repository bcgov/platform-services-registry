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

