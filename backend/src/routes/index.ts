import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import departmentsRouter from "./departments.js";
import doctorsRouter from "./doctors.js";
import patientsRouter from "./patients.js";
import appointmentsRouter from "./appointments.js";
import prescriptionsRouter from "./prescriptions.js";
import billsRouter from "./bills.js";
import dashboardRouter from "./dashboard.js";
import notificationsRouter from "./notifications.js";
import filesRouter from "./files.js";
import queueRouter from "./queue.js";
import settingsRouter from "./settings.js";
import reportsRouter from "./reports.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(departmentsRouter);
router.use(doctorsRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(prescriptionsRouter);
router.use(billsRouter);
router.use(dashboardRouter);
router.use(notificationsRouter);
router.use(filesRouter);
router.use(queueRouter);
router.use(settingsRouter);
router.use(reportsRouter);

export default router;
