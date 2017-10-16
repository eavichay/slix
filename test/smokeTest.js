describe('Smoke Tests', function() {
    const expect = require('expect.js');
    const Slix = require('../src/slix');

    it('Should be defined', function() {
        expect(Slix).to.be.ok();
    });

    it('Should return undefined for non-existing namespace', function() {
        expect(Slix.model('nonexistent')).to.be(undefined);
    });

    it('Should track nested changes', function(done) {
        const model = Slix.model('nested', {
            parent: {
                child: 123
            }
        });
        const unsub = model.subscribe( (changes, state) => {
            expect(changes['parent.child']).to.be(true);
            expect(state.parent.child).to.be(456);
            unsub();
            done();
        })
        model.parent.child = 456;
    })

    it('Should return an empty model', function() {
        expect(Object.keys(Slix.model('emptyModel', {})).length).to.be(0);
    });

    it('Should return a populated model', function() {
        const model = Slix.model('populated', {
            a: 1,
            b: 2,
            c: 3
        });
        expect(Object.keys(model).length).to.be(3);
        expect(model.a).to.be(1);
        expect(model.b).to.be(2);
        expect(model.c).to.be(3);
    });

    it('Should trigger subscriber', function(done) {
        const model = Slix.model('subscribed', {
            a: 1,
            b: 2,
            c: 3
        });
        const unsub = model.subscribe( () => {
            unsub();
            done();
        });
        model.a = 3;
    });

    it('Should trigger subscriber with information', function(done) {
        const model = Slix.model('subscribedWithInfo', {
            a: 1,
            b: 2,
            c: 3
        });
        const unsub = model.subscribe( (changes, data) => {
            unsub();
            expect(changes).to.be.ok();
            expect(changes.a).to.be(true);
            expect(changes.b).to.be(undefined);
            expect(changes.c).to.be(true);
            expect(data.a).to.be(111);
            expect(data.b).to.be(2);
            expect(data.c).to.be(333);
            done();
        });
        model.a = 111;
        model.c = 333;
    });

    it('Should not trigger subscriber with a not-predefined change', function(done) {
        const model = Slix.model('subscribedWithNonPredefinedProperty', {
            a: 1,
            b: 2,
            c: 3
        });
        const unsub = model.subscribe( (changes, data) => {
            unsub();
            expect(changes.d).to.be(undefined);
            expect(data.d).to.be(undefined);
            done();
        });
        model.a = 111;
        model.d = 'new';
    });
});