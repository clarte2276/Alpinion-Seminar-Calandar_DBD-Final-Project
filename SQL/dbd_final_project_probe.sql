CREATE DATABASE  IF NOT EXISTS `dbd_final_project` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dbd_final_project`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: dbd_final_project
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `probe`
--

DROP TABLE IF EXISTS `probe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `probe` (
  `Name` varchar(255) NOT NULL,
  `Type` varchar(100) DEFAULT NULL,
  `Application` text,
  PRIMARY KEY (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `probe`
--

LOCK TABLES `probe` WRITE;
/*!40000 ALTER TABLE `probe` DISABLE KEYS */;
INSERT INTO `probe` VALUES ('C1-6CT','Convex','Abdomen, EM, Gynecology, Obstetrics'),('C5-8N','Convex','Abdomen, Cardiac, EM'),('C5-8NT','Convex','Abdomen, EM, Cardiac, Pediatric'),('EC2-11H','Endocavity','Gynecology, Obstetrics, Urology, EM'),('EC3-10T','Endocavity','GYN, OB, Fetal Echo, Urology, EM'),('EV2-11H','Endocavity','Gynecology, Obstetrics, Urology, EM'),('EV3-10T','Endocavity','GYN, OB, Fetal Echo, Urology, EM'),('IO3-12','Linear','EM, Small Parts'),('IO7-18','Linear','Small Parts, MSK'),('IO8-17T','Linear','Small Parts, MSK'),('L10-25H','Linear','EM, MSK, Vascular, Small Parts'),('L3-12H','Linear','Breast, EM, MSK, Vascular, Small Parts'),('L3-12HWD','Linear','Breast, EM, MSK, Vascular, Small Parts, Appendix'),('L3-12T','Linear','Breast, EM, MSK, Vascular, Small Parts, Appendix'),('L3-12X','Linear','Breast, EM, MSK, Vascular, Small Parts'),('L3-15H','Linear','MSK, Vascular, Small Parts, EM'),('L3-8H','Linear','Breast, EM, MSK, Vascular, Small Parts'),('L8-17H','Linear','Breast, EM, MSK, Vascular, Small Parts'),('MP1-5X','Phased Array','Abdomen, Pediatric, Cardiac, EM, TCD'),('P1-5CT','Phased Array','Abdomen, Cardiac, EM, TCD'),('SC1-4H','Convex','Abdomen, EM, Gynecology, Obstetrics'),('SC1-4HS','Convex','Abdomen, EM, Gynecology, Obstetrics'),('SC1-6H','Convex','Abdomen, EM, Gynecology, Obstetrics'),('SC1-7H','Convex','Abdomen, EM, Gynecology, Obstetrics, Pediatric, Urology'),('SC2-11H','Convex','Abdomen, Pediatric, OB/GYN, Urology, EM'),('SC2-9H','Convex','Abdomen, EM, Gynecology, Obstetrics, Pediatric, Urology'),('SL3-19H','Linear','Abdomen, Pediatric, Gynecology, Obstetrics, EM, MSK, Vascular, Small Parts, TCD'),('SL3-19X','Linear','Abdomen, Pediatric, Gynecology, Obstetrics, EM, MSK, Vascular, Small Parts, TCD'),('SP3-8T','Phased Array','Abdomen, Cardiac, EM, Pediatric'),('SVC1-8H','Volume','Abdomen, Gynecology, Obstetrics, Pediatric, Urology, EM'),('VC1-6T','Volume','Abdomen, OB, GYN, EM'),('VE3-10H','Volume','Gynecology, Obstetrics, Urology, EM');
/*!40000 ALTER TABLE `probe` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-12 21:12:53
