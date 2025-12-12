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
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `EmployeeID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Position` varchar(100) DEFAULT NULL,
  `Team` varchar(100) DEFAULT NULL,
  `OrganizationName` varchar(255) DEFAULT NULL,
  `Contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`EmployeeID`),
  KEY `idx_employee_org` (`OrganizationName`),
  KEY `idx_employee_team` (`Team`),
  KEY `idx_employee_name` (`Name`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`OrganizationName`) REFERENCES `organization` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'강기덕','차장','국내 영업팀','알피니언 본사','010-7010-1001'),(2,'김진영','사원','국내 영업팀','알피니언 본사','010-7010-1002'),(3,'황재준','부장','국내 영업팀','알피니언 본사','010-7010-1003'),(4,'최진혁','차장','국내 영업팀','알피니언 본사','010-7010-1004'),(5,'황정근','차장','국내 영업팀','알피니언 본사','010-7010-1005'),(6,'기성아','대리','국내 영업팀','알피니언 본사','010-7010-1006'),(7,'김혜영','차장','국내 임상팀','알피니언 본사','010-7010-1007'),(8,'한다슬','사원','국내 임상팀','알피니언 본사','010-7010-1008'),(9,'최윤정','대리','국내 임상팀','알피니언 본사','010-7010-1009'),(10,'김나현','대리','국내 임상팀','알피니언 본사','010-7010-1010'),(11,'글로리_박영업','대리','국내 영업팀','글로리메디','010-7110-2001'),(12,'글로리_김영업','사원','국내 영업팀','글로리메디','010-7110-2002'),(13,'글로리_이임상','대리','국내 임상팀','글로리메디','010-7110-2003'),(14,'글로리_정임상','사원','국내 임상팀','글로리메디','010-7110-2004'),(15,'글로리_최지원','사원','영업 지원팀','글로리메디','010-7110-2005'),(16,'메디플_박영업','과장','국내 영업팀','메디플레이','010-7120-3001'),(17,'메디플_김영업','대리','국내 영업팀','메디플레이','010-7120-3002'),(18,'메디플_이임상','과장','국내 임상팀','메디플레이','010-7120-3003'),(19,'메디플_정임상','대리','국내 임상팀','메디플레이','010-7120-3004'),(20,'메디플_최지원','사원','영업 지원팀','메디플레이','010-7120-3005'),(21,'트루_박영업','차장','국내 영업팀','트루메디','010-7130-4001'),(22,'트루_김영업','대리','국내 영업팀','트루메디','010-7130-4002'),(23,'트루_이임상','차장','국내 임상팀','트루메디','010-7130-4003'),(24,'트루_정임상','대리','국내 임상팀','트루메디','010-7130-4004'),(25,'트루_최지원','사원','영업 지원팀','트루메디','010-7130-4005'),(26,'썬_박영업','과장','국내 영업팀','썬메디칼','010-7140-5001'),(27,'썬_김영업','대리','국내 영업팀','썬메디칼','010-7140-5002'),(28,'썬_이임상','과장','국내 임상팀','썬메디칼','010-7140-5003'),(29,'썬_정임상','대리','국내 임상팀','썬메디칼','010-7140-5004'),(30,'썬_최지원','사원','영업 지원팀','썬메디칼','010-7140-5005');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-12 21:12:52
