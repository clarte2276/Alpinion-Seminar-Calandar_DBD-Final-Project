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
-- Table structure for table `eventitem`
--

DROP TABLE IF EXISTS `eventitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventitem` (
  `EventItemID` int NOT NULL AUTO_INCREMENT,
  `ItemType` varchar(100) DEFAULT NULL,
  `ItemName` varchar(255) DEFAULT NULL,
  `MaxQuantity` int DEFAULT NULL COMMENT '주간 최대 사용 가능 수량',
  PRIMARY KEY (`EventItemID`),
  UNIQUE KEY `uk_eventitem_type_name` (`ItemType`,`ItemName`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventitem`
--

LOCK TABLES `eventitem` WRITE;
/*!40000 ALTER TABLE `eventitem` DISABLE KEYS */;
INSERT INTO `eventitem` VALUES (1,'기본','휴지',NULL),(2,'기본','물티슈',NULL),(3,'기본','멀티탭',NULL),(4,'기본','젤',NULL),(5,'기본','비닐봉지',NULL),(6,'브로셔','X50',NULL),(7,'브로셔','X60',NULL),(8,'브로셔','X70',NULL),(9,'브로셔','X90',NULL),(10,'브로셔','양면 라인업',NULL),(11,'브로셔','내과 카탈로그',NULL),(12,'브로셔','MSK 카탈로그',NULL),(13,'브로셔 홀더','3단 홀더',3),(14,'브로셔 홀더','L자 홀더',5),(15,'브로셔 홀더','T자 홀더',4),(16,'X배너','라인업 배너',2),(17,'X배너','EC-8 배너',1),(18,'X배너','카카오 배너',1),(19,'기타','방명록',3),(20,'기타','볼펜',NULL),(21,'기타','베드',6),(23,'기타','HDMI 분배기',1),(24,'기타','고광표 원장님 키트',1),(25,'기타','요가블럭',10),(26,'기타','조 명찰',NULL),(27,'기타','추가 스크린 키트',1),(28,'기타','팬텀 복장',10),(29,'X배너','한방 XC-50 배너',1),(32,'Custom','Custom Item Placeholder',NULL);
/*!40000 ALTER TABLE `eventitem` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-12 21:12:55
