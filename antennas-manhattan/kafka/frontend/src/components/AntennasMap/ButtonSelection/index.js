export const buildButtonSelection = (mapBox) => {
    mapBox.on('idle', () => {
        // If these two layers were not added to the map, abort
        if (!mapBox.getLayer('healthy-antennas-layer') || !mapBox.getLayer('unhealthy-antennas-layer')) {
            return;
        }

        // Enumerate ids of the layers.
        const toggleableLayerIds = ['healthy-antennas-layer', 'unhealthy-antennas-layer'];

        // Set up the corresponding toggle button for each layer.
        toggleableLayerIds.forEach((layerId) => {
            // Skip layers that already have a button set up.
            if (document.getElementById(layerId)) {
                return;
            }

            // Create a link.
            const link = document.createElement('a');
            link.id = layerId;
            link.href = '#';
            link.textContent = layerId;
            link.className = 'active';

            // Show or hide layer when the toggle is clicked.
            // eslint-disable-next-line no-loop-func
            link.onclick = function (e) {
                const clickedLayer = this.textContent;
                e.preventDefault();
                e.stopPropagation();

                const visibility = mapBox.getLayoutProperty(
                    clickedLayer,
                    'visibility'
                );

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === 'visible') {
                    mapBox.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    this.className = '';
                } else {
                    this.className = 'active';
                    mapBox.setLayoutProperty(
                        clickedLayer,
                        'visibility',
                        'visible'
                    );
                }
            };

            const layers = document.getElementById('menu');
            layers.appendChild(link);
        })
    });
};
