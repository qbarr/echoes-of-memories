const QUERY_RESULT = 0x8866;
const QUERY_RESULT_AVAILABLE = 0x8867;

////
// Taken from https://github.com/tsherif/picogl.js/tree/master/src

export class Query {
	constructor(gl, target) {
		this.gl = gl;
		this.query = null;
		this.target = target;
		this.active = false;
		this.result = null;
		this.restore();
	}

	/**
        Restore query after context loss.
        @method
        @return {Query} The Query object.
    */
	restore() {
		this.query = this.gl.createQuery();
		this.active = false;
		this.result = null;

		return this;
	}

	/**
        Begin a query.
        @method
        @return {Query} The Query object.
    */
	begin() {
		if (!this.active) {
			this.gl.beginQuery(this.target, this.query);
			this.result = null;
		}

		return this;
	}

	/**
        End a query.
        @method
        @return {Query} The Query object.
    */
	end() {
		if (!this.active) {
			this.gl.endQuery(this.target);
			this.active = true;
		}

		return this;
	}

	/**
        Check if query result is available.
        @method
        @return {boolean} If results are available.
    */
	ready() {
		if (this.active && this.gl.getQueryParameter(this.query, QUERY_RESULT_AVAILABLE)) {
			this.active = false;
			// Note(Tarek): Casting because FF incorrectly returns booleans.
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1422714
			this.result = Number(this.gl.getQueryParameter(this.query, QUERY_RESULT));
			return true;
		}

		return false;
	}

	/**
        Delete this query.
        @method
        @return {Query} The Query object.
    */
	delete() {
		if (this.query) {
			this.gl.deleteQuery(this.query);
			this.query = null;
		}

		return this;
	}
}
