from abc import ABC, abstractmethod
from datetime import datetime
import io
import matplotlib.image as mpimg
import matplotlib.patches as patches
import matplotlib.pyplot as plt
from fastapi.responses import StreamingResponse

class Metric(ABC):
    def __init__(self, map_width, map_height, map_path):
        self.map_width = map_width
        self.map_height = map_height
        self.map_path = map_path
        self.map = mpimg.imread(self.map_path)

    @abstractmethod
    async def generate_map(self, threshold: float, color_scheme: str, bw: float, transparency: float, excludeHumans: bool, excludeVehicles: bool, from_date: datetime, to_date: datetime):
        pass

    @abstractmethod
    async def generate_graph(self, areas: str, from_date: datetime, to_date: datetime):
        pass

    def _kde_to_buffer(self, areas, ax, message=""):
        buff = io.BytesIO()
        for area in areas:
            patch = patches.Rectangle((area["x0"], area["y0"]), area["x1"] - area["x0"],
                                      area["y1"] - area["y0"], fill=False, edgecolor="red", linestyle="--", linewidth=0.5)
            ax.add_patch(patch)
        if message != "":
            ax.text(self.map_width / 2, self.map_height /
                    2, message, ha='center', va='center')
        ax.imshow(self.map, extent=[self.map_width, 0, 0, self.map_height])
        ax.axis("off")
        ax.figure.savefig(buff, bbox_inches='tight', pad_inches=0, dpi=600)
        ax.figure.clf()

        buff.seek(0)
        return buff

    def _message_to_buffer(self, message):
        return self._kde_to_buffer([], plt.axes(), message)

    def _parse_areas(self, s):
        if s == "":
            return []

        seqs = s.split(";")

        areas = []
        for seq in seqs:
            a = {}
            parts = [float(p) for p in seq.split(",")]
            # transpose coordinates
            a["x1"] = self.map_width - parts[0] * self.map_width
            a["y1"] = self.map_height - parts[1] * self.map_height
            a["x0"] = self.map_width - (parts[0] + parts[2]) * self.map_width
            a["y0"] = self.map_height - (parts[1] + parts[3]) * self.map_height
            areas.append(a)

        return areas

    async def handle_map_request(self, areas: str, threshold: float, color_scheme: str, bw: float, transparency: float, exclude_humans: bool, exclude_vehicles: bool, from_date: datetime, to_date: datetime):
        try:
            kde = await self.generate_map(threshold, color_scheme, bw, transparency, exclude_humans, exclude_vehicles, from_date, to_date)
            if kde is not None:
                buf = self._kde_to_buffer(self._parse_areas(areas), kde)
            else:
                buf = self._message_to_buffer("Keine Daten")
        except Exception as e:
            print(e)
            if (str(e) == "Contour levels must be increasing"):
                e = "Nicht genug Daten"
            buf = self._message_to_buffer("Fehler: " + str(e))

        return StreamingResponse(buf, media_type="image/png")

    async def handle_graph_request(self, areas: str, from_date: datetime, to_date: datetime):
        return await self.generate_graph(self._parse_areas(areas), from_date, to_date)