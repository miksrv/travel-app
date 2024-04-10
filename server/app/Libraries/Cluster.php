<?php namespace App\Libraries;

const OFFSET = 268435456;
const RADIUS =  85445659.4471;
const MAX_ZOOM = 18;

class Cluster {
    public array $placeMarks;

    public function __construct(array $placeMarks, int $zoom) {
        if ($zoom === MAX_ZOOM) {
            return $this->placeMarks = $placeMarks;
        }

        $placeMarks = $this->cluster($placeMarks, 20, $zoom);

        foreach ($placeMarks as $key => $item) {
            if (!is_array($item)) {
                continue;
            }

            $averageLat = 0;
            $averageLon = 0;
            $pointCount = count($item);

            foreach ($item as $poi) {
                $averageLat += $poi->lat;
                $averageLon += $poi->lon;
            }

            $placeMarks[$key] = (object) [
                'lat' => round($averageLat / $pointCount, 6),
                'lon' => round($averageLon / $pointCount, 6),
                'type'  => 'cluster',
                'count' => $pointCount
            ];

            if (isset($item[0]->filename)) {
                $photoPath = PATH_PHOTOS . $item[0]->placeId . '/' . $item[0]->filename;
                $placeMarks[$key]->preview = $photoPath . '_preview.' . $item[0]->extension;
            }
        }

        return $this->placeMarks = $placeMarks;
    }

    /**
     * @param float $lon
     * @return float
     */
    private function lonToX(float $lon): float {
        return round(OFFSET + RADIUS * $lon * pi() / 180);
    }

    /**
     * @param float $lat
     * @return float
     */
    private function latToY(float $lat): float {
        return round(OFFSET - RADIUS * log((1 + sin($lat * pi() / 180)) / (1 - sin($lat * pi() / 180))) / 2);
    }

    /**
     * @param float $lat1
     * @param float $lon1
     * @param float $lat2
     * @param float $lon2
     * @param int $zoom
     * @return int
     */
    private function pixelDistance(float $lat1, float $lon1, float $lat2, float $lon2, int $zoom): int {
        $x1 = $this->lonToX($lon1);
        $y1 = $this->latToY($lat1);

        $x2 = $this->lonToX($lon2);
        $y2 = $this->latToY($lat2);

        return sqrt(pow(($x1-$x2),2) + pow(($y1-$y2),2)) >> (21 - $zoom);
    }

    /**
     * @param array $markers
     * @param int $distance
     * @param int $zoom
     * @return array
     */
    private function cluster(array $markers, int $distance, int $zoom): array {
        $clustered = [];

        /* Loop until all markers have been compared. */
        while (count($markers)) {
            $marker  = array_pop($markers);
            $cluster = [];

            /* Compare against all markers which are left. */
            foreach ($markers as $key => $target) {
                $pixels = $this->pixelDistance(
                    $marker->lat,
                    $marker->lon,
                    $target->lat,
                    $target->lon,
                    $zoom
                );

                /* If two markers are closer than given distance remove */
                /* target marker from array and add it to cluster.      */
                if ($distance > $pixels) {
                    unset($markers[$key]);
                    $cluster[] = $target;
                }
            }

            /* If a marker has been added to cluster, add also the one  */
            /* we were comparing to and remove the original from array. */
            if (count($cluster) > 0) {
                $cluster[] = $marker;
                $clustered[] = $cluster;
            } else {
                $clustered[] = $marker;
            }
        }

        return $clustered;
    }
}
