import { Router } from 'express';
import { getListings, createListing } from '../controllers/listingsController.js';
import { getOffers, createOffer } from '../controllers/offersController.js';
import { getFarmer, getTasks } from '../controllers/farmerController.js';
import { validateBody } from '../middleware/validate.js';
import { CropListingSchema, BargainOfferSchema } from '../utils/validators.js';

const router = Router();

router.get('/listings', getListings);
router.post('/listings', validateBody(CropListingSchema), createListing);

router.get('/offers', getOffers);
router.post('/offers', validateBody(BargainOfferSchema), createOffer);

router.get('/farmer/:phone', getFarmer);
router.get('/tasks/:phone', getTasks);

export default router;
