//photogallerys
app.post('/photogallerys', async (req, res) => {
    const notice = req.body;
    const result = await photogalleryCollection.insertOne(notice);
    res.send(result);
})

//photogallerys update
app.put('/photogallerys/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true };
    const updatePhotoGallery = req.body;

    const update = {
        $set: updatePhotoGallery
    }

    const result = await photogalleryCollection.updateOne(filter, update, options);
    res.send(result);
})
app.get('/photogallerys', async (req, res) => {
    const photogallerys = await photogalleryCollection.find().toArray();
    res.send(photogallerys);
});

app.delete('/photogallerys/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await photogalleryCollection.deleteOne(query);
    res.send(result);
})
app.get('/photogallerys/:id', async (req, res) => {
    const id = req.params.id;;
    const query = { _id: new ObjectId(id) }
    const result = await photogalleryCollection.findOne(query);
    res.send(result);
});