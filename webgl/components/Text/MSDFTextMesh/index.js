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
		if (props.centerMesh !== undefined) {
			if (typeof props.centerMesh === 'boolean') {
				this.centerMesh = { x: props.centerMesh, y: props.centerMesh };
			} else if (Array.isArray(props.centerMesh)) {
				this.centerMesh = { x: props.centerMesh[0], y: props.centerMesh[1] };
			} else {
				this.centerMesh = props.centerMesh;
			}
		} else {
			this.centerMesh = { x: false, y: false };
		}

		this.position = new Vector3();
		this.scale = new Vector2(1, 1);

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

	edit(content) {
		this.geo.update({ text: content });
		this.content = content;
		this.updateTextPosition();
	}

	updateGeo(arg = {}) {
		this.geo.update(arg);
		if (arg.text) this.content = arg.text;
		this.updateTextPosition();
	}

	updateTextPosition(force = false) {
		const { width, height } = this.geo._layout;

		if (this.centerMesh.x || force)
			this.mesh.position.x = -width * 0.5 * this.mesh.scale.x;
		else this.mesh.position.x = 0;

		if (this.centerMesh.y || force)
			this.mesh.position.y = height * 0.5 * this.mesh.scale.y;
		else this.mesh.position.y = 0;
	}

	update() {
		this.base.position.copy(this.position);
		this.base.scale.set(this.scale.x, this.scale.y, 1);
	}

	/// #if __DEBUG__
	devtools(_gui) {
		const gui = (_gui ?? this.scene?.gui ?? this.webgl.$gui).addFolder({
			title: this.name,
		});

		gui.addBinding(this, 'content', { label: 'Content' }).on('change', ({ value }) =>
			this.edit(value),
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
		}).on('change', ({ value }) => this.geo.update({ letterSpacing: value }));
		gui.addBinding(o, 'tabSize', {
			label: 'Tab Size',
			min: 0,
			max: 10,
			step: 1,
		}).on('change', ({ value }) => this.geo.update({ tabSize: value }));

		gui.addSeparator();

		gui.addBinding(this.centerMesh, 'x', { label: 'Center Text X' }).on(
			'change',
			({ value }) => this.updateTextPosition(),
		);
		gui.addBinding(this.centerMesh, 'y', { label: 'Center Text Y' }).on(
			'change',
			({ value }) => this.updateTextPosition(),
		);
	}
	/// #endif
}
