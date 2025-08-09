const { Router } = require('express');
const router = Router();
const path = require('path');

const PUBLIC_PATH = path.join(__dirname, '..', 'public/html/general');

router.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_PATH, 'groupsMain.html'));
});


module.exports = router;