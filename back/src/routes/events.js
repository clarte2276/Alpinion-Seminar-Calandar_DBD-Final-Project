const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// 메인 캘린더 화면: 월별 행사 목록 조회
router.get('/', eventController.getEventsByMonth);

// 행사 상세 화면: 단일 행사 정보 조회
router.get('/:eventId', eventController.getEventDetail);

// 새 일정 생성 화면: 행사와 관계 테이블 생성
router.post('/', eventController.createEvent);

// 일정 수정 화면: 행사와 관계 테이블 갱신
router.put('/:eventId', eventController.updateEvent);

// 일정 삭제 화면: 행사와 관계 테이블 삭제
router.delete('/:eventId', eventController.deleteEvent);

// 일정 복제 화면: 행사와 관계 테이블 복제
router.post('/:eventId/clone', eventController.cloneEvent);

module.exports = router;
