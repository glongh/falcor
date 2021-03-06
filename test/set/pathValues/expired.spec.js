var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $pathValue = require("falcor-json-graph").pathValue;

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setPathValues = require("../../../lib/set/setPathValues");

describe("an expired value", function() {

    it("converts a negative $expires value to an absolute time", function() {

        var cache = {};
        var version = 0;

        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']", {
                    $expires: -1000
                }))
            ]
        );
        var value = cache.grids.id[0];
        var expires = value.$expires;

        expect(expires > Date.now()).to.be.true;
        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } }
        }));
    });

    it("sets through an immediately expired reference", function() {

        var startTime = Date.now();
        var cache = {};
        var version = 0;
        var expired = [];

        setPathValues(
            getModel({ cache: cache, expired: expired, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']", {
                    $expires: 0
                })),
                $pathValue("grid[0][0].title", "Pulp Fiction")
            ]
        );

        expect(expired.length).to.equal(1);
        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: { 0: { title: $atom("Pulp Fiction") } } } }
        }));
    });

    it("sets through an already expired reference", function() {

        var startTime = Date.now();
        var cache = {};
        var version = 0;
        var expired = [];

        setPathValues(
            getModel({ cache: cache, expired: expired, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']", {
                    $expires: startTime - 10
                })),
                $pathValue("grid[0][0].title", "Pulp Fiction")
            ]
        );

        expect(expired.length).to.equal(1);
        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: { 0: { title: $atom("Pulp Fiction") } } } }
        }));
    });
});