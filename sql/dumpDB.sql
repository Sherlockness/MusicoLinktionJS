-- MySQL dump 10.13  Distrib 5.5.60, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: MusicoLinktion
-- ------------------------------------------------------
-- Server version	5.5.60-0+deb8u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `mclk_services_profiles`
--

DROP TABLE IF EXISTS `mclk_services_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mclk_services_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prefix` varchar(5) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mclk_services_profiles`
--

LOCK TABLES `mclk_services_profiles` WRITE;
/*!40000 ALTER TABLE `mclk_services_profiles` DISABLE KEYS */;
INSERT INTO `mclk_services_profiles` VALUES (1,'lfm','Last.fm','Last.fm api'),(2,'disc','Discogs','Discogs api');
/*!40000 ALTER TABLE `mclk_services_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mclk_users`
--

DROP TABLE IF EXISTS `mclk_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mclk_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `mail` varchar(250) NOT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `mailValidated` tinyint(4) NOT NULL DEFAULT '0',
  `mailValidation` int(11) DEFAULT NULL,
  `mailValidationHost` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mclk_users`
--

LOCK TABLES `mclk_users` WRITE;
/*!40000 ALTER TABLE `mclk_users` DISABLE KEYS */;
INSERT INTO `mclk_users` VALUES (1,'admin','74ea4d56343965ac46165e1959070322','admin@rcnetwork.be','profile',1,118,NULL),(2,'webapp','74ea4d56343965ac46165e1959070322','web@rcnetwork.be','full',1,NULL,NULL),(43,'Sherlockness','$2a$10$W6RL/xx0NBVjPZKVA/oO1eOhWyqf2LQqT.3EEWESVqihVk2IKfrh6','ronald.corazza@rcnetwork.be',NULL,1,75,NULL);
/*!40000 ALTER TABLE `mclk_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mclk_usersServicesProfiles_data`
--

DROP TABLE IF EXISTS `mclk_usersServicesProfiles_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mclk_usersServicesProfiles_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usersServicesProfiles_id` int(11) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_usersServicesProfiles_data_servicesProfiles` (`usersServicesProfiles_id`),
  CONSTRAINT `FK_usersServicesProfiles_data_servicesProfiles` FOREIGN KEY (`usersServicesProfiles_id`) REFERENCES `mclk_users_servicesProfiles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mclk_usersServicesProfiles_data`
--

LOCK TABLES `mclk_usersServicesProfiles_data` WRITE;
/*!40000 ALTER TABLE `mclk_usersServicesProfiles_data` DISABLE KEYS */;
INSERT INTO `mclk_usersServicesProfiles_data` VALUES (19,15,'username','Sherlockness'),(20,15,'session_key','rkj-KtNzhns-A9uz3zYL2tqvogNIF2cq');
/*!40000 ALTER TABLE `mclk_usersServicesProfiles_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mclk_users_servicesProfiles`
--

DROP TABLE IF EXISTS `mclk_users_servicesProfiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mclk_users_servicesProfiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `service_profile` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_users_servicesProfiles_users` (`user_id`),
  KEY `FK_users_servicesProfiles_servicesProfiles` (`service_profile`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mclk_users_servicesProfiles`
--

LOCK TABLES `mclk_users_servicesProfiles` WRITE;
/*!40000 ALTER TABLE `mclk_users_servicesProfiles` DISABLE KEYS */;
INSERT INTO `mclk_users_servicesProfiles` VALUES (15,43,1);
/*!40000 ALTER TABLE `mclk_users_servicesProfiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_access_tokens`
--

DROP TABLE IF EXISTS `oauth_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_access_tokens` (
  `id` int(14) NOT NULL AUTO_INCREMENT,
  `access_token` varchar(256) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `client_id` int(14) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `oauth_access_tokens_id_unique` (`id`),
  KEY `oauth_client_id` (`client_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_access_tokens_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `oauth_access_tokens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `mclk_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_access_tokens`
--

LOCK TABLES `oauth_access_tokens` WRITE;
/*!40000 ALTER TABLE `oauth_access_tokens` DISABLE KEYS */;
INSERT INTO `oauth_access_tokens` VALUES (1,'81b011b7f3a903f4e30a19988c8985a16f22d64f','2019-01-01 00:00:00',NULL,NULL,NULL),(2,'35d35de511f004fa4132fff79cf0bcf9f03f1c49','2019-01-01 00:00:00',NULL,NULL,NULL),(3,'f70252ff1b57493a5eaf27212b72cd24f12cf764','2019-01-01 00:00:00',NULL,NULL,1),(4,'aefdf36e9ff2947f121e15cbe2680fc309ebd945','2019-01-01 00:00:00',NULL,NULL,NULL),(5,'40898bede94699b0385878c6d37d0284e59e2abf','2019-01-01 00:00:00',NULL,NULL,NULL),(6,'4b1d4673bda41926c065a9acb0b3e7bb31f5ea24','2019-01-01 00:00:00',NULL,NULL,NULL),(7,'0143e8f0d9f3ccc43c62aa87c38c40f23a5e9ba4','2019-01-01 00:00:00',NULL,NULL,NULL),(8,'8c5234b1372c2b78b4d96f3b6f5db8932fa29762','2019-01-01 00:00:00',NULL,NULL,NULL),(9,'61fe2c5b0faf9ff96334356b1527ba73b190fa3d','2019-01-01 00:00:00',NULL,NULL,NULL),(10,'b6c9212f29909ec5db9dbeaa4e80f71b507df37f','2019-01-01 00:00:00',NULL,NULL,1),(11,'4185ab5b52452ae295c3011f04c8c13c4115d325','2019-01-01 00:00:00',NULL,NULL,1),(12,'253734e26e1ec8d7389d23458eedf06d6cb50392','2019-01-01 00:00:00',NULL,1,1),(13,'8161e39caa925cc069e0e709de840fd30be9b7eb','2019-01-01 00:00:00',NULL,1,1),(14,'a602543f6bdd6092779939bf1de2299a905dbfec','2019-01-01 00:00:00',NULL,1,1),(15,'25263fd984cdb089b866608e91c5c17fbc7662a9','2019-01-01 00:00:00',NULL,1,1),(16,'009adb36c0b2c8d4269676908562fe0a5f0169c3','2019-01-01 00:00:00',NULL,1,1),(17,'11e3209ea6a793011f7296d566840edf20ac8cd9','2019-01-01 00:00:00',NULL,1,1),(18,'8226f459dd246a9d1b66ae6671572c38e03a5c57','2019-01-01 00:00:00',NULL,1,1),(19,'1ca9fe68115a5ecb441af33d8b29ed8fd4aa20d0','2019-01-01 00:00:00','consultant',1,1),(20,'15397cb9904a954a31e162f7635adffb554293ef','2019-01-01 00:00:00','consultant',1,1),(21,'691199101e65b704befca81cb811800aaa8e2ab5','2019-01-01 00:00:00','consultant',1,1),(22,'9c9a78392f164542071d3d3ec8bf8e99e8909ffa','2019-01-01 00:00:00',NULL,1,1),(23,'06a158438f7685f77b514dd79349af0748a0ba4b','2019-01-01 00:00:00',NULL,1,1),(24,'2ed79b5743f81418a8da0c5825d67e36be570466','2019-01-01 00:00:00',NULL,1,1),(25,'4f65fe82d3f9f167328646d710d080f3b270990b','2019-01-01 00:00:00',NULL,1,1),(26,'0327759746fe5be483943c64eaa018de2d1b72b8','2019-01-01 00:00:00',NULL,1,1),(27,'9000675b1e23427d7933ea42865605464d1d5600','2019-01-01 00:00:00',NULL,1,1),(28,'e3476d9a25cde4ba533c32b4fbd172f55adef84b','2019-01-01 00:00:00',NULL,1,1),(29,'a6116f80d7e174e25922912aaed3e5f5972bdfc0','2019-01-01 00:00:00',NULL,1,1),(30,'21d6074e3b1657f088ea233ece902022e8161910','2019-01-01 00:00:00',NULL,1,1),(31,'83a3a6e42e160716f4c534d1c61f87d78bdf2204','2019-01-01 00:00:00',NULL,1,1),(32,'dfc39e4194313191c13a86cbc9d34ca7ffda8b49','2019-01-01 00:00:00','consultant',1,1),(33,'635399997087ef64b813957e20b542ae407c229f','2019-01-01 00:00:00',NULL,1,1),(34,'4095857d971198669fe3a92a9be2d9f08fa4b09b','2019-01-01 00:00:00',NULL,1,1),(35,'b36eaf38995433675531c99abb977199a1b36530','2019-01-01 00:00:00',NULL,1,1),(36,'5a815d1bf7f87cd9465e4599876ce32acfa8bdad','2019-01-01 00:00:00',NULL,1,1),(37,'68dfffb1ab1888ba260501786abffb556d789315','2018-07-11 17:13:45','6afdffe1eb0581200ddb958f7422b62f979e6660',1,1),(38,'b177e4bb0a79b4f0ff83f854a4b276ed679465f6','2018-06-27 18:25:45','profile',1,1),(39,'19fcb709b7cda58a2671961fd0d15993b8c18ea6','2018-06-27 18:28:09','profile',1,1),(40,'0f480fe3ae46d678665160bd6c7358e7c8ef1dee','2018-06-27 18:28:48',NULL,1,1),(41,'5be4e35d9a76f60e7c63f10dbe79cabbf5cefca8','2018-06-27 18:29:36','profile',1,1),(42,'0cd2fbfd0f0e965bb9a4ebc7660787aa96720690','2018-07-05 11:42:26','profile',1,1),(43,'9c2c80a9ffcc956d8ffe38712a21ab0ffed97fe9','2018-07-05 11:43:19','profile',1,1),(44,'b93669576ad8eff492103fa4416570228b61d831','2018-07-05 11:46:03',NULL,1,1),(45,'908002530a72ccd22812825f5530601bd02070e0','2018-07-05 12:57:02','profile',1,1),(46,'08a2d962fa97882decc2056a83e03ccabc32f6f8','2018-07-10 10:26:50',NULL,1,1),(47,'1450dd7f6bdc67474c4a08779d001a1ab6c95a9f','2018-07-10 12:55:03',NULL,1,1),(48,'daeddff9a0ad28b9e85ee2aa61f0b5c686dd9770','2018-07-10 16:04:49',NULL,1,1),(49,'62d637d6574add9e8131cab769cfdee701158d30','2018-07-10 17:06:24',NULL,1,1),(50,'8a0f4e5cc983db6f012be171047467578aaa28b8','2018-07-10 18:08:52',NULL,1,1),(51,'2d31aa815e29ddc9e62ccba87d1b2fdd044fdaa6','2018-07-11 11:18:01','profile',1,1),(52,'ca410e7706fad0a720f26b7890a4d7a58e1ae2f6','2018-07-11 13:19:57','profile',1,1),(53,'d741cb62ba99b128b465e6c316a86929042f4479','2018-07-11 16:22:32','profile',1,1),(54,'86d3330224212a07d20789634003f2bae16e1b59','2018-07-12 10:45:31','profile',1,1);
/*!40000 ALTER TABLE `oauth_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_authorization_codes`
--

DROP TABLE IF EXISTS `oauth_authorization_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_authorization_codes` (
  `id` int(14) NOT NULL AUTO_INCREMENT,
  `authorization_code` varchar(256) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `redirect_uri` varchar(2000) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `client_id` int(14) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `oauth_authorization_codes_id_unique` (`id`),
  KEY `oauth_client_id` (`client_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_authorization_codes_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `oauth_authorization_codes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `mclk_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_authorization_codes`
--

LOCK TABLES `oauth_authorization_codes` WRITE;
/*!40000 ALTER TABLE `oauth_authorization_codes` DISABLE KEYS */;
INSERT INTO `oauth_authorization_codes` VALUES (1,NULL,'2016-05-14 18:45:02',NULL,NULL,NULL,1),(2,NULL,'2016-05-14 18:45:10',NULL,NULL,NULL,1),(3,NULL,'2016-05-14 18:45:15',NULL,NULL,NULL,1),(4,NULL,'2016-05-14 18:45:41',NULL,NULL,NULL,1),(5,NULL,'2016-05-14 18:46:59',NULL,NULL,NULL,1),(6,NULL,'2016-05-14 18:47:22',NULL,NULL,NULL,1),(7,NULL,'2016-05-14 18:51:16',NULL,NULL,NULL,1),(8,NULL,'2016-05-14 18:52:10',NULL,NULL,NULL,1),(9,NULL,'2016-05-14 18:52:33',NULL,NULL,NULL,1),(10,NULL,'2016-05-14 18:54:20',NULL,NULL,1,1),(11,NULL,'2016-05-14 18:56:08',NULL,NULL,1,1),(12,NULL,'2016-05-14 18:57:44',NULL,NULL,1,1),(13,'513418e2d3a7f6ab72a63100a298d9ddb8ad0b8e','2019-05-14 18:59:49',NULL,NULL,1,1),(14,'993fa8fe3be5691baa73801e31420f406b1516f8','2016-05-14 19:04:08',NULL,NULL,1,1),(15,'e78351c1b13dc09a3c51d24123b2dfb2bf178306','2016-05-14 19:04:25',NULL,NULL,1,1);
/*!40000 ALTER TABLE `oauth_authorization_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_clients`
--

DROP TABLE IF EXISTS `oauth_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_clients` (
  `id` int(14) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `client_id` varchar(80) DEFAULT NULL,
  `client_secret` varchar(80) DEFAULT NULL,
  `redirect_uri` varchar(2000) DEFAULT NULL,
  `grant_types` varchar(80) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `oauth_clients_id_unique` (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `mclk_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_clients`
--

LOCK TABLES `oauth_clients` WRITE;
/*!40000 ALTER TABLE `oauth_clients` DISABLE KEYS */;
INSERT INTO `oauth_clients` VALUES (1,NULL,'democlient','democlientsecret','http://localhost/cb',NULL,'profile',1),(2,NULL,'$2a$10$ZEGoN9qT5b5o7K9/MXaDKe5Twg2l8tBKcAr07LWyVXUM7TBhztcFW','$2a$10$S1msAqq6a5RHF.PQ8.1CduNZG0aaf1WVrDf0EGNle5jLr58pN/f92','http://localhost','refresh_token','profile',NULL),(3,NULL,'$2a$10$ukUmv/Ptlpmjg2A9tkEe2.s.QbqSgs9AtrcElePXww/ycQnkhrOEG','$2a$10$yOTvhM89mt82voq2HWrZduTnzvUqthvcnpk/G5L9sFELCUU2HPnJO','http://localhost','refresh_token','profile',NULL),(4,NULL,'$2a$10$TUPcL8v/OYo0FIvb6RRmdOhfEnSnKQicyzQ17Apxa5Ljv8PV2FLCu','$2a$10$zFG/WOemEtR7GXzQeZ.4RuJsFOjKu0wnB0CZB51Or8ybmkztB8P8y','http://localhost','refresh_token','profile',43);
/*!40000 ALTER TABLE `oauth_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_refresh_tokens`
--

DROP TABLE IF EXISTS `oauth_refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_refresh_tokens` (
  `id` int(14) NOT NULL AUTO_INCREMENT,
  `refresh_token` varchar(256) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `client_id` int(14) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `oauth_refresh_tokens_id_unique` (`id`),
  KEY `client_id` (`client_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_refresh_tokens_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `oauth_refresh_tokens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `mclk_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_refresh_tokens`
--

LOCK TABLES `oauth_refresh_tokens` WRITE;
/*!40000 ALTER TABLE `oauth_refresh_tokens` DISABLE KEYS */;
INSERT INTO `oauth_refresh_tokens` VALUES (1,'6beb7f8b4b7ab60fe123e0430a3f7081da486152','2016-05-28 18:09:56',NULL,NULL,NULL),(2,'5dcdbd119a19f3655cc8e247c2f5165822d24399','2016-05-28 18:10:34',NULL,NULL,NULL),(3,'3879deb38e38a12a5f5f75ecd142cfcdad00384b','2016-05-28 18:17:06',NULL,NULL,NULL),(4,'51021e085ceb17f66701b3f736a1150eadf89ae1','2016-05-28 18:17:25',NULL,NULL,NULL),(5,'6658a45a863123535b5331898aa6da44bc352379','2016-05-28 18:18:04',NULL,NULL,NULL),(6,'c28a74b985cc5d95a71d1344c91f40a0e24fc19b','2016-05-28 18:19:50',NULL,1,NULL),(7,'73c49f0adb6ebcb1903245653bb2377ec5dcd31e','2016-05-28 18:25:40',NULL,1,NULL),(8,'bd5a641e7dce63a11c34a7740a74cf7e1223a1da','2016-05-28 18:26:25',NULL,1,NULL),(9,'f033a1cc559762ad8ba05244054a8f465a3b8b28','2016-05-28 18:27:31',NULL,1,1),(10,'bb67c127cd9653899089eea0938e0da97372056d','2016-05-28 18:28:36',NULL,1,1),(11,'0e9f3e2dfd02205c7dba197cf54c1cff432ea6fd','2016-05-28 18:30:06',NULL,1,1),(12,'5b05a19d83ffb4f0559e9df464983deeae87e486','2016-05-28 18:31:30',NULL,1,1),(13,'929df161fe9921a0e4750de3c532036f99e40fe7','2016-05-28 18:31:55',NULL,1,1),(14,'d96008566a2e84aecb403d869e2ea362f88221fc','2016-05-28 18:32:07',NULL,1,1),(15,'f4f1a52886d564aa80fcae8eafcabef579a1feb0','2016-05-28 18:32:40',NULL,1,1),(16,'d7df4d8bf5472131d3e5d032b5884c65b9a2f65a','2016-05-28 18:34:00',NULL,1,1),(20,'8ab0c52713e3cb055d7bab949d34806a2807d084','2016-05-28 18:37:17','consultant',1,1),(21,'2b11b4e4559a42f2d9ccbdf7b1ba4c83b79f015e','2016-05-28 18:47:27',NULL,1,1),(22,'2dfd5a0303b1b7444445fd82287076bcdd535e44',NULL,NULL,1,1),(24,'59d66d169923ae3c26bcccbe9b2d893279efd62e','2016-05-28 18:59:03','consultant',1,1),(25,'ce3a313e9a98c9cbbe80b0b243d3f9f19d5bb1cb',NULL,NULL,1,1),(26,'aacfcc24f97b0a8f4455d7c67017a72159d78f79','2016-05-28 19:14:11',NULL,1,1),(27,'38daf52ad366a2044e06f446880209c0738167d3','2018-07-11 17:25:45','profile',1,1),(29,'dcb01220a2ffb663e5d3d469d44712f4154edc31','2018-07-11 17:28:48',NULL,1,1),(31,'19e23067947f9929ea1a4bccc3bebff55b6b85f0','2018-07-19 10:46:03',NULL,1,1),(37,'f3fa59872b34413242930581967c981ab8fb2da9','2018-07-24 17:08:52',NULL,1,1),(38,'1ef7cf6779fe8c7d17b7a8225fa226df8b535255','2018-07-25 15:22:32','profile',1,1);
/*!40000 ALTER TABLE `oauth_refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_scopes`
--

DROP TABLE IF EXISTS `oauth_scopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_scopes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scope` varchar(80) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `oauth_scopes_id_unique` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_scopes`
--

LOCK TABLES `oauth_scopes` WRITE;
/*!40000 ALTER TABLE `oauth_scopes` DISABLE KEYS */;
INSERT INTO `oauth_scopes` VALUES (1,'profile',NULL),(2,'full',NULL);
/*!40000 ALTER TABLE `oauth_scopes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-01 17:30:07
