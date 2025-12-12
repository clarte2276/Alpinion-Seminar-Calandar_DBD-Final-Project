const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 관리자 페이지: 조직 관리
router.get('/organizations', adminController.listOrganizations);
router.post('/organizations', adminController.createOrganization);
router.put('/organizations/:name', adminController.updateOrganization);
router.delete('/organizations/:name', adminController.deleteOrganization);

// 관리자 페이지: 직원 관리
router.get('/employees', adminController.listEmployees);
router.post('/employees', adminController.createEmployee);
router.put('/employees/:id', adminController.updateEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);

// 관리자 페이지: 아르바이트 인력 관리
router.get('/part-time-workers', adminController.listPartTimeWorkers);
router.post('/part-time-workers', adminController.createPartTimeWorker);
router.put('/part-time-workers/:id', adminController.updatePartTimeWorker);
router.delete('/part-time-workers/:id', adminController.deletePartTimeWorker);

// 관리자 페이지: 장비 관리 (초음파/프로브)
router.get('/ultrasounds', adminController.listUltraSounds);
router.post('/ultrasounds', adminController.createUltraSound);
router.put('/ultrasounds/:name', adminController.updateUltraSound);
router.delete('/ultrasounds/:name', adminController.deleteUltraSound);

router.get('/probes', adminController.listProbes);
router.get('/ultrasound-probe-compatibility', adminController.listUltrasoundProbeCompatibility);
router.put('/ultrasounds/:name/compatibility', adminController.updateUltrasoundCompatibility);
router.post('/probes', adminController.createProbe);
router.put('/probes/:name', adminController.updateProbe);
router.delete('/probes/:name', adminController.deleteProbe);

// 관리자 페이지: 행사 아이템 관리
router.get('/event-items', adminController.listEventItems);
router.post('/event-items', adminController.createEventItem);
router.put('/event-items/:id', adminController.updateEventItem);
router.delete('/event-items/:id', adminController.deleteEventItem);

module.exports = router;
