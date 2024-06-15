import WaveformViewer from './waveformViewer';
// https://github.com/theatre-js/theatre/blob/4d7373e1a9b4263923c0923d0e48976db65a10be/packages/r3f/src/extension/index.ts#L4

export const waveformViewerExtension = () => {
	let viewer = null;

	return {
		id: 'waveform-extension',
		toolbars: {
			global(set, studio) {
				const toolsetConfig = [
					{
						type: 'Icon',
						title: 'Waveform Viewer',
						svgSource: '🔉',
						onClick: (_) => {
							if (!viewer.visible) studio.createPane('waveform');
						},
					},
				];
				viewer = new WaveformViewer();
				set(toolsetConfig);
			},
		},
		panes: [
			{
				class: 'waveform',
				mount({ paneId, node }) {
					viewer.visible = true;

					node.appendChild(viewer.$el);
					viewer.init();

					return () => {
						viewer.visible = false;
					};
				},
			},
		],
		addAudio(data = {}) {
			viewer?.addAudio(data);
		},
	};
};
