import BaseComponent from '#webgl/core/BaseComponent';
import { Mesh, Object3D } from 'three';
import MSDFTextGeometry from '../MSDFTextGeometry';
import MSDFTextMaterial from '../MSDFTextMaterial';


export default class MSDFTextMesh extends BaseComponent {
	constructor({ content = '', font = 'VCR_OSD_MONO', ...props } = {}) {
		super(props);

		this.font = font;
		this.content = content;

		const { $assets } = this.webgl;
		const { data, texture } = ($assets.getFont(font) ?? $assets.getFont('VCR_OSD_MONO'))

		const geometry = this.geo = new MSDFTextGeometry({
			text: content,
			font: data,
			width: props.width ?? null,
			align: props.align ?? 'left',
			lineHeight: props.lineHeight ?? null,
			letterSpacing: props.letterSpacing ?? 0,
			tabSize: props.tabSize ?? 4,
		});

		const material = this.mat = new MSDFTextMaterial({
			uniforms: {
				uMap: { value: texture },
			}
		});

		const text = this.mesh = new Mesh(geometry, material);
		text.scale.setScalar(0.01);
		text.scale.y *= -1;

		this.base = new Object3D();
		this.base.add(text);
	}

	edit(content) {
		this.geo.update({ text: content });
		this.content = content;
	}

	update() {

		if (!this.props.alignCenter) return
		// center text according to its width
		const { width } = this.geo._layout._options
		if (width === null) return;
		this.mesh.position.x = -width / 2;
	}

	/// #if __DEBUG__
	devtools() {
		const gui = this.webgl.$gui.addFolder({title: 'Text'});

		gui.addBinding(this, 'content', { label: 'Content' })
			.on('change', ({ value }) => this.edit(value));

		const o = this.geo._layout._options
		const alignOpts = ['left', 'center', 'right']
		gui.addBlade({
			view: 'list',
			label: 'Align',
			options: alignOpts.map(value => ({ value, text: value })),
			value: o.align
		}).on('change', ({ value }) => this.geo.update({ align: value }));


		gui.addSeparator();

		const fw = {
			forced: false || o.width !== null,
			value: 100,
			numberGui: null,
		}

		fw.numberGui = gui.addBinding(fw, 'value', { label: 'Width', min: 0, max: 1000 })
			.on('change', ({ value }) => this.geo.update({ width: value }));
		fw.numberGui.disabled = !fw.forced;

		gui.addBinding(fw, 'forced', { label: 'Force Width' })
			.on('change', ({ value }) => {
				fw.forced = value;
				fw.numberGui.disabled = !value;
				if (value) {
					this.geo.update({ width: fw.value });
				} else {
					this.geo.update({ width: null });
				}
			});

		gui.addSeparator();


		const flh = {
			forced: false || o.lineHeight !== null,
			value: 100,
			numberGui: null,
		}

		flh.numberGui = gui.addBinding(flh, 'value', { label: 'Line Height', min: 0, max: 1000 })
			.on('change', ({ value }) => this.geo.update({ lineHeight: value }));
		flh.numberGui.disabled = !flh.forced;

		gui.addBinding(flh, 'forced', { label: 'Force Line Height' })
			.on('change', ({ value }) => {
				flh.forced = value;
				flh.numberGui.disabled = !value;
				if (value) {
					this.geo.update({ lineHeight: flh.value });
				} else {
					this.geo.update({ lineHeight: null });
				}
			});

		gui.addSeparator();

		gui.addBinding(o, 'letterSpacing', { label: 'Letter Spacing', min: -10, max: 20 })
			.on('change', ({ value }) => this.geo.update({ letterSpacing: value }));
		gui.addBinding(o, 'tabSize', { label: 'Tab Size', min: 0, max: 10, step: 1 })
			.on('change', ({ value }) => this.geo.update({ tabSize: value }));
	}
	/// #endif
}
