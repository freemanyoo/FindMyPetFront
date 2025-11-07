// src/components/KakaoMap.jsx

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const KakaoMap = forwardRef(({ isSelectable = false, initialLocation, onLocationSelect }, ref) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const placesService = useRef(null);

    useEffect(() => {
        if (!window.kakao || !window.kakao.maps) {
            console.error("카카오 지도 API가 로드되지 않았습니다.");
            return;
        }

        const { kakao } = window;
        const initialLat = initialLocation?.latitude || 37.566826;
        const initialLng = initialLocation?.longitude || 126.9786567;
        const initialPos = new kakao.maps.LatLng(initialLat, initialLng);

        const options = { center: initialPos, level: 3 };
        const map = new kakao.maps.Map(mapContainer.current, options);
        mapInstance.current = map;

        const marker = new kakao.maps.Marker({ position: initialPos, map: map });
        markerInstance.current = marker;

        placesService.current = new kakao.maps.services.Places();

        if (isSelectable) {
            const geocoder = new kakao.maps.services.Geocoder();
            kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
                const latlng = mouseEvent.latLng;
                markerInstance.current.setPosition(latlng);

                geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        const address = result[0]?.road_address?.address_name || result[0]?.address?.address_name;
                        if (onLocationSelect) {
                            onLocationSelect({
                                location: address,
                                latitude: latlng.getLat(),
                                longitude: latlng.getLng(),
                            });
                        }
                    }
                });
            });
        }
    }, []); // 초기 렌더링 시 한 번만 실행되도록 의존성 배열을 비움

    useImperativeHandle(ref, () => ({
        searchPlace: (keyword) => {
            if (!placesService.current || !keyword.trim()) return;

            placesService.current.keywordSearch(keyword, (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    const firstPlace = data[0];
                    const newPos = new kakao.maps.LatLng(firstPlace.y, firstPlace.x);

                    mapInstance.current.setCenter(newPos);

                    if (onLocationSelect) {
                        onLocationSelect({
                            location: firstPlace.place_name,
                            latitude: parseFloat(firstPlace.y),
                            longitude: parseFloat(firstPlace.x),
                        });
                    }
                } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                    alert('검색 결과가 존재하지 않습니다.');
                } else {
                    alert('검색 중 오류가 발생했습니다.');
                }
            });
        }
    }));

    return (
        <div ref={mapContainer} style={{ height: '300px', width: '100%', borderRadius: '15px', border: '2px solid #e0e0e0' }}></div>
    );
});

export default KakaoMap;