import BaseComponent from '#webgl/core/BaseComponent';
import { varsToUniforms } from '#webgl/utils/varToUniform';
import { Mesh, Object3D, Vector2, Vector3 } from 'three';
import MSDFTextGeometry from '../MSDFTextGeometry';
import MSDFTextMaterial, { uniforms } from '../MSDFTextMaterial';

const defaultOptions = {
	color: uniforms.common.uColor.value,
	opacity: uniforms.common.uOpacity.value,

	strokeColor: uniforms.stroke.uStrokeColor.value,
	strokeOpacity: uniforms.stroke.uStrokeOpacity.value,
	strokeWidth: uniforms.stroke.uStrokeInsetWidth.value,

	width: null,
	align: 'left',
	lineHeight: null,
	letterSpacing: 0,
	tabSize: 4,
};

const SCALE = 0.1;

export default class MSDFTextMesh extends BaseComponent {
	constructor({ content = '', font = 'VCR_OSD_MONO', ...props } = {}) {
		props = Object.assign(defaultOptions, props);
		super(props);

		this.font = font;
		this.content = content;
		this.centerMesh = props.centerMesh ?? false;
		this.position = new Vector3();
		this.scale = new Vector2(1, 1);

		this.editInterval = null;

		const { $assets } = this.webgl;
		const { data, texture } = $assets.getFont(font);

		/* Geometry */
		const geoProps = Object.assign(
			{},
			{
				text: content,
				font: data,
				width: props.width,
				align: props.align,
				lineHeight: props.lineHeight,
				letterSpacing: props.letterSpacing,
				tabSize: props.tabSize,
			},
		);
		const geometry = (this.geo = new MSDFTextGeometry(geoProps));

		/* Material */
		const matProps = Object.assign(
			{},
			varsToUniforms({
				color: props.color,
				opacity: props.opacity,
				strokeColor: props.strokeColor,
				strokeOpacity: props.strokeOpacity,
				// strokeOutsetWidth: props.strokeOutsetWidth,
				strokeInsetWidth: props.strokeWidth,
			}),
		);
		const material = (this.mat = new MSDFTextMaterial({
			uniforms: {
				uMap: { value: texture },
				...matProps,
			},
		}));

		/* Mesh */
		const text = (this.mesh = new Mesh(geometry, material));
		text.scale.setScalar(SCALE);
		text.scale.y *= -1;
		this.updateTextPosition();

		this.base = new Object3D();
		this.base.add(text);
	}

	edit(
		content,
		{ wordByWord = false, letterByLetter = false, speed = 1 } = {},
	) {
		this.content = content;

		clearInterval(this.editInterval);
		this.editInterval = null;

		if (letterByLetter) {
			const letters = content.split('');
			let i = 0;
			this.editInterval = setInterval(() => {
				const letter = letters[i];
				if (letter === undefined) {
					clearInterval(this.editInterval);
					return;
				}
				const _content = letters.slice(0, i + 1).join('');
				this.geo.update({ text: _content });
				this.updateTextPosition();
				i++;
			}, 100 / speed);
		} else if (wordByWord) {
			const words = content.split(' ');
			let i = 0;
			this.editInterval = setInterval(() => {
				const word = words[i];
				if (word === undefined) {
					clearInterval(this.editInterval);
					return;
				}
				const _content = words.slice(0, i + 1).join(' ');
				this.geo.update({ text: _content });
				this.updateTextPosition();
				i++;
			}, 200 / speed);
		} else {
			this.geo.update({ text: content });
			this.updateTextPosition();
		}
	}

	updateGeo(arg = {}) {
		this.geo.update(arg);
		if (arg.text) this.content = arg.text;
		this.updateTextPosition();
	}

	updateTextPosition(force = false) {
		if (!this.centerMesh) {
			this.mesh.position.set(0, 0, 0);
			return;
		}

		const { width, height } = this.geo._layout;
		if (width !== null)
			this.mesh.position.x = -width * 0.5 * this.mesh.scale.x;
		if (height !== null)
			this.mesh.position.y = height * 0.5 * this.mesh.scale.y;
	}

	update() {
		this.base.position.copy(this.position);
		this.base.scale.set(this.scale.x, this.scale.y, 1);
	}

	/// #if __DEBUG__
	devtools(_gui) {
		const gui = (_gui ?? this.webgl.$gui).addFolder({ title: this.name });

		gui.addBinding(this, 'content', { label: 'Content' }).on(
			'change',
			({ value }) => this.edit(value),
		);

		const o = this.geo._layout._options;
		const alignOpts = ['left', 'center', 'right'];
		gui.addBlade({
			view: 'list',
			label: 'Align',
			options: alignOpts.map((value) => ({ value, text: value })),
			value: o.align,
		}).on('change', ({ value }) => this.geo.update({ align: value }));

		gui.addSeparator();

		const fw = {
			forced: false || o.width !== null,
			value: 100,
			numberGui: null,
		};

		fw.numberGui = gui
			.addBinding(fw, 'value', { label: 'Width', min: 0, max: 1000 })
			.on('change', ({ value }) => this.updateGeo({ width: value }));
		fw.numberGui.disabled = !fw.forced;

		gui.addBinding(fw, 'forced', { label: 'Force Width' }).on(
			'change',
			({ value }) => {
				fw.forced = value;
				fw.numberGui.disabled = !value;
				value
					? this.updateGeo({ width: fw.value })
					: this.updateGeo({ width: null });
			},
		);

		gui.addSeparator();

		const flh = {
			forced: false || o.lineHeight !== null,
			value: 100,
			numberGui: null,
		};

		flh.numberGui = gui
			.addBinding(flh, 'value', {
				label: 'Line Height',
				min: 0,
				max: 1000,
			})
			.on('change', ({ value }) => this.updateGeo({ lineHeight: value }));
		flh.numberGui.disabled = !flh.forced;

		gui.addBinding(flh, 'forced', { label: 'Force Line Height' }).on(
			'change',
			({ value }) => {
				flh.forced = value;
				flh.numberGui.disabled = !value;
				value
					? this.updateGeo({ lineHeight: flh.value })
					: this.updateGeo({ lineHeight: null });
			},
		);

		gui.addSeparator();

		gui.addBinding(o, 'letterSpacing', {
			label: 'Letter Spacing',
			min: -10,
			max: 20,
		}).on('change', ({ value }) =>
			this.geo.update({ letterSpacing: value }),
		);
		gui.addBinding(o, 'tabSize', {
			label: 'Tab Size',
			min: 0,
			max: 10,
			step: 1,
		}).on('change', ({ value }) => this.geo.update({ tabSize: value }));

		gui.addSeparator();

		gui.addBinding(this, 'centerMesh', { label: 'Center Mesh' }).on(
			'change',
			({ value }) => this.updateTextPosition(),
		);
	}
	/// #endif
}
