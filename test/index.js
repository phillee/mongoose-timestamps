var expect     = require('chai').expect
  , mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , timestamps = require('../index')

mongoose.connect('mongodb://localhost/hto_timestamps')
mongoose.connection.on('error', function(err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application')
});

var TestObjSchema = new Schema({
  name : String
});

TestObjSchema.plugin(timestamps);

var TestObj = mongoose.model('test_obj', TestObjSchema);

describe('timestamps', function() {
  it('should set createdAt and updatedAt to the same value on creation', function(done) {
    var testObj = new TestObj({ name : 'lulu' });
    testObj.save(function(err) {
      expect(testObj.createdAt).to.exist;
      expect(testObj.createdAt).to.equal(testObj.updatedAt);
      done();
    });
  })

  it('should have updatedAt > createdAt when updating', function(done) {
    TestObj.findOne({ name : 'lulu' }, function(err, testObj) {
      testObj.name = 'sf5';
      setTimeout(function() {
        testObj.save(function(err, updated) {
          expect(updated.updatedAt).to.be.above(updated.createdAt);
          done();
        });
      }, 50);
    });
  })

  it('should not change updatedAt if it is set explicitly', function(done) {
    TestObj.create({ name : 'morgana' }, function(err, testObj) {
      var existingUpdatedAt = testObj.updatedAt

      testObj.name = 'kayle';
      testObj.updatedAt = existingUpdatedAt
      testObj.markModified('updatedAt')

      setTimeout(function() {
        testObj.save(function(err, updated) {
          expect(updated.updatedAt).to.equal(existingUpdatedAt);
          expect(updated.name).to.equal('kayle');
          done();
        });
      }, 50);
    });
  })

  it('should set updatedAt instead of generating if it is set explicitly', function(done) {
    var partyTime = new Date(1999, 1, 1)

    TestObj.create({ name : 'partay', updatedAt : partyTime }, function(err, testObj) {
      expect(testObj.updatedAt).to.equal(partyTime);
      done();
    });
  })

  describe('options', function() {
    it('should set createdAt if createdAt == true', function(done) {
      var CreatedAtTrueSchema,  CreatedAtTrueObj

      CreatedAtTrueSchema = new Schema(
        {
          name : String
        }
      );

      CreatedAtTrueSchema.plugin(timestamps, { createdAt : true });

      CreatedAtTrueObj = mongoose.model('created_at_true_obj', CreatedAtTrueSchema);

      var testObj = new CreatedAtTrueObj({ name : 'ashe' });
      testObj.save(function(err) {
        expect(testObj.createdAt).to.exist;
        expect(testObj.updatedAt).to.exist;
        expect(testObj.updatedAt).to.equal(testObj.createdAt);
        done();
      });
    })

    it('should not set createdAt if createdAt == false', function(done) {
      var OnlyUpdatedAtSchema,  OnlyUpdatedAtObj

      OnlyUpdatedAtSchema = new Schema(
        {
          name : String
        }
      );

      OnlyUpdatedAtSchema.plugin(timestamps, { createdAt : false });

      OnlyUpdatedAtObj = mongoose.model('only_updated_at_obj', OnlyUpdatedAtSchema);

      var testObj = new OnlyUpdatedAtObj({ name : 'lulu' });
      testObj.save(function(err) {
        expect(testObj.createdAt).to.not.exist;
        expect(testObj.createdAt).to.be.undefined;
        expect(testObj.updatedAt).to.exist;
        done();
      });
    })

    it('should not set updatedAt if updatedAt == false', function(done) {
      var OnlyCreatedAtSchema, OnlyCreatedAtObj

      OnlyCreatedAtSchema = new Schema(
        {
          name : String
        }
      );

      OnlyCreatedAtSchema.plugin(timestamps, { updatedAt : false });

      OnlyCreatedAtObj = mongoose.model('only_created_at_obj', OnlyCreatedAtSchema);

      var testObj = new OnlyCreatedAtObj({ name : 'zed' });
      testObj.save(function(err) {
        expect(testObj.updatedAt).to.not.exist;
        expect(testObj.updatedAt).to.be.undefined;
        expect(testObj.createdAt).to.exist;
        done();
      });
    })
  })
})