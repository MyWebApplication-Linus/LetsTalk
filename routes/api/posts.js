const express = require('express');
const router = express.Router();

//@route  Get api/post
//@desc   Test Route
//@access  public
router.get('/', (req, res) => {
    res.send('Post route')
});


module.export = router;