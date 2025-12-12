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
-- Table structure for table `ultrasoundprobecompatibility`
--

DROP TABLE IF EXISTS `ultrasoundprobecompatibility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ultrasoundprobecompatibility` (
  `UltraSoundName` varchar(255) NOT NULL,
  `ProbeName` varchar(255) NOT NULL,
  PRIMARY KEY (`UltraSoundName`,`ProbeName`),
  KEY `ProbeName` (`ProbeName`),
  CONSTRAINT `ultrasoundprobecompatibility_ibfk_1` FOREIGN KEY (`UltraSoundName`) REFERENCES `ultrasound` (`Name`) ON DELETE CASCADE,
  CONSTRAINT `ultrasoundprobecompatibility_ibfk_2` FOREIGN KEY (`ProbeName`) REFERENCES `probe` (`Name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ultrasoundprobecompatibility`
--

LOCK TABLES `ultrasoundprobecompatibility` WRITE;
/*!40000 ALTER TABLE `ultrasoundprobecompatibility` DISABLE KEYS */;
INSERT INTO `ultrasoundprobecompatibility` VALUES ('E-CUBE 8','C1-6CT'),('E-CUBE 8 Diamond','C1-6CT'),('X-CUBE 50','C1-6CT'),('X-CUBE i8','C1-6CT'),('E-CUBE 8','C5-8NT'),('E-CUBE 8 Diamond','C5-8NT'),('X-CUBE 60','EC2-11H'),('X-CUBE 70 with Elite','EC2-11H'),('X-CUBE 90 with Elite','EC2-11H'),('X-CUBE i9','EC2-11H'),('E-CUBE 8','EC3-10T'),('E-CUBE 8 Diamond','EC3-10T'),('X-CUBE 50','EC3-10T'),('X-CUBE i8','EC3-10T'),('X-CUBE 60','EV2-11H'),('X-CUBE 70 with Elite','EV2-11H'),('X-CUBE 90 with Elite','EV2-11H'),('X-CUBE i9','EV2-11H'),('E-CUBE 8','EV3-10T'),('E-CUBE 8 Diamond','EV3-10T'),('X-CUBE 50','EV3-10T'),('X-CUBE i8','EV3-10T'),('E-CUBE 8','IO3-12'),('E-CUBE 8 Diamond','IO3-12'),('X-CUBE 70 with Elite','IO7-18'),('X-CUBE 90 with Elite','IO7-18'),('X-CUBE i9','IO7-18'),('E-CUBE 8','IO8-17T'),('E-CUBE 8 Diamond','IO8-17T'),('X-CUBE 60','L10-25H'),('X-CUBE 70 with Elite','L10-25H'),('X-CUBE 90 with Elite','L10-25H'),('X-CUBE i9','L10-25H'),('E-CUBE 8','L3-12H'),('E-CUBE 8 Diamond','L3-12H'),('E-CUBE 8','L3-12HWD'),('E-CUBE 8 Diamond','L3-12HWD'),('X-CUBE 50','L3-12HWD'),('E-CUBE 8','L3-12T'),('E-CUBE 8 Diamond','L3-12T'),('X-CUBE i8','L3-12T'),('X-CUBE 60','L3-12X'),('X-CUBE 70 with Elite','L3-12X'),('X-CUBE 90 with Elite','L3-12X'),('X-CUBE 50','L3-15H'),('X-CUBE 60','L3-15H'),('X-CUBE 70 with Elite','L3-15H'),('X-CUBE 50','L3-8H'),('X-CUBE 60','L3-8H'),('X-CUBE 70 with Elite','L3-8H'),('X-CUBE 90 with Elite','L3-8H'),('X-CUBE i8','L3-8H'),('X-CUBE i9','L3-8H'),('E-CUBE 8','L8-17H'),('E-CUBE 8 Diamond','L8-17H'),('X-CUBE 70 with Elite','MP1-5X'),('X-CUBE 90 with Elite','MP1-5X'),('X-CUBE i9','MP1-5X'),('E-CUBE 8','P1-5CT'),('E-CUBE 8 Diamond','P1-5CT'),('X-CUBE 50','P1-5CT'),('X-CUBE 60','P1-5CT'),('X-CUBE i8','P1-5CT'),('E-CUBE 8 Diamond','SC1-4H'),('E-CUBE 8 Diamond','SC1-4HS'),('E-CUBE 8 Diamond','SC1-6H'),('X-CUBE 60','SC1-7H'),('X-CUBE 70 with Elite','SC1-7H'),('X-CUBE 90 with Elite','SC1-7H'),('X-CUBE i9','SC1-7H'),('X-CUBE 50','SC2-11H'),('X-CUBE 60','SC2-11H'),('X-CUBE 70 with Elite','SC2-11H'),('X-CUBE 90 with Elite','SC2-11H'),('X-CUBE 70 with Elite','SC2-9H'),('X-CUBE 90 with Elite','SC2-9H'),('X-CUBE 70 with Elite','SL3-19H'),('X-CUBE 90 with Elite','SL3-19H'),('X-CUBE i9','SL3-19H'),('X-CUBE 60','SL3-19X'),('X-CUBE 70 with Elite','SL3-19X'),('X-CUBE 90 with Elite','SL3-19X'),('E-CUBE 8','SP3-8T'),('E-CUBE 8 Diamond','SP3-8T'),('X-CUBE 70 with Elite','SP3-8T'),('X-CUBE 90 with Elite','SP3-8T'),('임시','SP3-8T'),('X-CUBE 50','SVC1-8H'),('X-CUBE 60','SVC1-8H'),('X-CUBE 70 with Elite','SVC1-8H'),('X-CUBE 90 with Elite','SVC1-8H'),('E-CUBE 8','VC1-6T'),('E-CUBE 8 Diamond','VC1-6T'),('E-CUBE 8','VE3-10H'),('E-CUBE 8 Diamond','VE3-10H');
/*!40000 ALTER TABLE `ultrasoundprobecompatibility` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-12 21:12:54
