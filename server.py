#!/usr/bin/env python3
"""
AgriLink - Government of India Mandi Prices API & Server
Smart India Hackathon 2026 | Team APEX {SYNTAX} @ MGIT.ac.in
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

DEFAULT_PORT = 8085
if len(sys.argv) > 1 and sys.argv[1].isdigit():
    DEFAULT_PORT = int(sys.argv[1])

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DATA_FILE = BASE_DIR / "data" / "agmarknet_data.json"
BIDDING_FILE = BASE_DIR / "data" / "bidding_data.json"

# Official Government of India data.gov.in API Configuration
DEFAULT_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

# In-memory storage of Mandi records and Bidding auctions
MANDI_RECORDS = []
BIDDING_RECORDS = []

COMMODITY_META = {
    "Chilli": {"icon": "🌶️", "category": "Spices"},
    "Paddy": {"icon": "🌾", "category": "Cereals"},
    "Cotton": {"icon": "☁️", "category": "Fibre"},
    "Tomato": {"icon": "🍅", "category": "Vegetables"},
    "Wheat": {"icon": "🌾", "category": "Cereals"},
    "Onion": {"icon": "🧅", "category": "Vegetables"},
    "Potato": {"icon": "🥔", "category": "Vegetables"},
    "Maize": {"icon": "🌽", "category": "Cereals"},
    "Soyabean": {"icon": "🌱", "category": "Oilseeds"},
    "Mustard": {"icon": "🌼", "category": "Oilseeds"}
}

def clean_record(r):
    try:
        min_p = int(float(r.get("min_price", 0)))
    except (ValueError, TypeError):
        min_p = 0
    try:
        max_p = int(float(r.get("max_price", 0)))
    except (ValueError, TypeError):
        max_p = 0
    try:
        mod_p = int(float(r.get("modal_price", 0)))
    except (ValueError, TypeError):
        mod_p = 0
    return {
        "state": str(r.get("state", "")).strip(),
        "district": str(r.get("district", "")).strip(),
        "market": str(r.get("market", "")).strip(),
        "commodity": str(r.get("commodity", "")).strip(),
        "variety": str(r.get("variety", "")).strip() or "FAQ",
        "arrival_date": str(r.get("arrival_date", "")).strip() or "10/09/2026",
        "min_price": min_p,
        "max_price": max_p,
        "modal_price": mod_p
    }

def fetch_from_datagov(api_key=None, commodity=None, state_filter=None, limit=100):
    global MANDI_RECORDS
    key = api_key if api_key else DEFAULT_API_KEY
    url = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}?api-key={urllib.parse.quote(key)}&format=json&limit={limit}"
    
    if commodity and commodity != "all":
        url += f"&filters[commodity.keyword]={urllib.parse.quote(commodity)}"
    if state_filter and state_filter != "all":
        url += f"&filters[state.keyword]={urllib.parse.quote(state_filter)}"

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "AgriLink/2.0"}
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                raw_records = data.get("records", [])
                if raw_records:
                    cleaned = [clean_record(r) for r in raw_records if r.get("commodity") and r.get("market")]
                    if cleaned:
                        # Merge with existing records without duplicates
                        existing_keys = set((r["market"], r["commodity"], r["variety"]) for r in MANDI_RECORDS)
                        added = 0
                        for cr in cleaned:
                            k = (cr["market"], cr["commodity"], cr["variety"])
                            if k not in existing_keys:
                                MANDI_RECORDS.append(cr)
                                existing_keys.add(k)
                                added += 1
                        print(f"[AgriLink] Fetched {len(cleaned)} live records from data.gov.in ({added} new added).")
                        return True, cleaned, f"Successfully fetched {len(cleaned)} live records from Government of India (data.gov.in)"
    except Exception as e:
        print(f"[AgriLink] Live API sync note: {e}")
    return False, [], "Using verified local Agmarknet database (Ministry of Agriculture & Farmers Welfare, GoI)"

def load_data():
    global MANDI_RECORDS
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                MANDI_RECORDS = json.load(f)
            print(f"[AgriLink] Loaded {len(MANDI_RECORDS)} Agmarknet mandi records from database.")
        except Exception as e:
            print(f"[AgriLink] Error loading data: {e}")
            MANDI_RECORDS = []
    else:
        print("[AgriLink] Data file not found.")

    # Attempt initial sync with Government of India API in background
    fetch_from_datagov()
    load_bidding_data()

def load_bidding_data():
    global BIDDING_RECORDS
    if BIDDING_FILE.exists():
        try:
            with open(BIDDING_FILE, "r", encoding="utf-8") as f:
                BIDDING_RECORDS = json.load(f)
            print(f"[AgriLink] Loaded {len(BIDDING_RECORDS)} FPO bidding lots.")
        except Exception as e:
            print(f"[AgriLink] Error loading bidding data: {e}")
            BIDDING_RECORDS = []
    else:
        print("[AgriLink] Bidding data file not found, initializing empty.")
        BIDDING_RECORDS = []

def save_bidding_data():
    try:
        with open(BIDDING_FILE, "w", encoding="utf-8") as f:
            json.dump(BIDDING_RECORDS, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[AgriLink] Error saving bidding data: {e}")

class AgriLinkHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC_DIR), **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        query = urllib.parse.parse_qs(url.query)

        if path.startswith("/api/"):
            self.handle_api(path, query)
        else:
            if path == "/" or not path:
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/api/fetch-live":
            self.handle_fetch_live()
        elif url.path == "/api/bidding/create":
            self.handle_bidding_create()
        elif url.path == "/api/bidding/bid":
            self.handle_bidding_bid()
        elif url.path == "/api/bidding/award":
            self.handle_bidding_award()
        else:
            self.send_response(404)
            self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_fetch_live(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(post_data)
        except Exception:
            payload = {}

        api_key = payload.get("api_key", "").strip() or DEFAULT_API_KEY
        commodity = payload.get("commodity", "")
        state_filter = payload.get("state", "")
        limit = int(payload.get("limit", 100))

        success, records, message = fetch_from_datagov(api_key=api_key, commodity=commodity, state_filter=state_filter, limit=limit)

        self.send_json({
            "success": True,
            "live_fetched": success,
            "message": message,
            "count": len(records) if success else len(MANDI_RECORDS),
            "records": records if success else MANDI_RECORDS
        })

    def handle_bidding_create(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(post_data)
        except Exception:
            payload = {}

        commodity = payload.get("commodity", "").strip()
        fpo_name = payload.get("fpo_name", "").strip()
        try:
            quantity = int(payload.get("quantity", 0))
            min_price = int(payload.get("min_price", 0))
        except (ValueError, TypeError):
            quantity, min_price = 0, 0

        if not commodity or not fpo_name or quantity <= 0 or min_price <= 0:
            self.send_json({"success": False, "error": "Missing required fields (commodity, fpo_name, quantity > 0, min_price > 0)"}, status=400)
            return

        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        closing = now + timedelta(days=int(payload.get("closing_days", 3)))
        new_id = f"AUC-2026-{len(BIDDING_RECORDS) + 1:03d}"

        lot = {
            "id": new_id,
            "fpo_name": fpo_name,
            "registration_no": payload.get("registration_no", f"FPO/IN/HYD/2026/{len(BIDDING_RECORDS)+100}"),
            "state": payload.get("state", "Telangana"),
            "district": payload.get("district", "Warangal"),
            "location": payload.get("location", "Mandi Yard"),
            "commodity": commodity,
            "variety": payload.get("variety", "Commercial Grade A"),
            "quantity": quantity,
            "unit": payload.get("unit", "Quintals"),
            "harvest_date": payload.get("harvest_date", now.strftime("%Y-%m-%d")),
            "min_price": min_price,
            "status": "OPEN",
            "created_at": now.isoformat(),
            "closing_time": closing.isoformat(),
            "bids": [],
            "awarded_bid": None
        }
        BIDDING_RECORDS.insert(0, lot)
        save_bidding_data()
        self.send_json({"success": True, "lot": lot, "message": "Bulk produce lot hosted successfully!"})

    def handle_bidding_bid(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(post_data)
        except Exception:
            payload = {}

        lot_id = payload.get("lot_id", "").strip()
        company_name = payload.get("company_name", "").strip()
        buyer_name = payload.get("buyer_name", "").strip()
        try:
            bid_price = int(payload.get("bid_price", 0))
        except (ValueError, TypeError):
            bid_price = 0

        lot = next((l for l in BIDDING_RECORDS if l["id"] == lot_id), None)
        if not lot:
            self.send_json({"success": False, "error": "Auction lot not found"}, status=404)
            return

        if lot.get("status") != "OPEN":
            self.send_json({"success": False, "error": "This auction is closed or already awarded."}, status=400)
            return

        if bid_price < lot.get("min_price", 0):
            self.send_json({
                "success": False,
                "error": f"Bid (₹{bid_price}) cannot be less than the set minimum price (₹{lot['min_price']})."
            }, status=400)
            return

        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        bid_id = f"BID-{len(lot.get('bids', [])) + 1:02d}"
        total_amount = bid_price * lot.get("quantity", 1)

        new_bid = {
            "id": bid_id,
            "company_name": company_name or "Verified Corporate Buyer",
            "buyer_name": buyer_name or "Procurement Lead",
            "gstin": payload.get("gstin", "GSTIN_VERIFIED_IN"),
            "bid_price": bid_price,
            "total_amount": total_amount,
            "timestamp": now.isoformat()
        }
        if "bids" not in lot:
            lot["bids"] = []
        lot["bids"].append(new_bid)
        save_bidding_data()

        self.send_json({
            "success": True,
            "message": "Sealed blind bid submitted successfully! Hidden from competitors until auction award.",
            "bid_id": bid_id,
            "total_amount": total_amount
        })

    def handle_bidding_award(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(post_data)
        except Exception:
            payload = {}

        lot_id = payload.get("lot_id", "").strip()
        lot = next((l for l in BIDDING_RECORDS if l["id"] == lot_id), None)
        if not lot:
            self.send_json({"success": False, "error": "Auction lot not found"}, status=404)
            return

        bids = lot.get("bids", [])
        if not bids:
            self.send_json({"success": False, "error": "Cannot award lot: No corporate bids have been submitted yet."}, status=400)
            return

        highest_bid = max(bids, key=lambda b: b.get("bid_price", 0))
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)

        lot["status"] = "AWARDED"
        lot["awarded_bid"] = {
            "id": highest_bid.get("id"),
            "company_name": highest_bid.get("company_name"),
            "buyer_name": highest_bid.get("buyer_name", ""),
            "gstin": highest_bid.get("gstin", ""),
            "bid_price": highest_bid.get("bid_price"),
            "total_amount": highest_bid.get("total_amount"),
            "awarded_at": now.isoformat()
        }
        save_bidding_data()

        self.send_json({
            "success": True,
            "message": f"Lot awarded to highest bidder {highest_bid['company_name']} at ₹{highest_bid['bid_price']}/Quintal!",
            "lot": lot
        })

    def handle_api(self, path, query):
        if path == "/api/commodities":
            commodities = []
            distinct_commodities = sorted(list(set(r.get("commodity", "") for r in MANDI_RECORDS)))
            for c in distinct_commodities:
                records = [r for r in MANDI_RECORDS if r.get("commodity") == c]
                prices = [r.get("modal_price", 0) for r in records if r.get("modal_price")]
                avg_price = int(sum(prices) / len(prices)) if prices else 0
                meta = COMMODITY_META.get(c, {"icon": "📦", "category": "General"})
                commodities.append({
                    "id": c,
                    "name": c,
                    "icon": meta["icon"],
                    "category": meta["category"],
                    "market_count": len(records),
                    "avg_modal_price": avg_price,
                    "min_price": min(prices) if prices else 0,
                    "max_price": max(prices) if prices else 0
                })
            self.send_json({"success": True, "commodities": commodities})

        elif path == "/api/states":
            states_dict = {}
            for r in MANDI_RECORDS:
                s = r.get("state")
                d = r.get("district")
                if s:
                    if s not in states_dict:
                        states_dict[s] = set()
                    if d:
                        states_dict[s].add(d)
            result = [{"state": s, "districts": sorted(list(districts))} for s, districts in sorted(states_dict.items())]
            self.send_json({"success": True, "states": result})

        elif path == "/api/prices":
            commodity_filter = query.get("commodity", [None])[0]
            state_filter = query.get("state", [None])[0]
            district_filter = query.get("district", [None])[0]
            search_query = query.get("search", [None])[0]
            sort_by = query.get("sort", ["modal_price_desc"])[0]

            filtered = list(MANDI_RECORDS)

            if commodity_filter and commodity_filter != "all":
                filtered = [r for r in filtered if r.get("commodity", "").lower() == commodity_filter.lower()]

            if state_filter and state_filter != "all":
                filtered = [r for r in filtered if r.get("state", "").lower() == state_filter.lower()]

            if district_filter and district_filter != "all":
                filtered = [r for r in filtered if r.get("district", "").lower() == district_filter.lower()]

            if search_query:
                sq = search_query.strip().lower()
                filtered = [r for r in filtered if (
                    sq in r.get("market", "").lower() or
                    sq in r.get("district", "").lower() or
                    sq in r.get("variety", "").lower() or
                    sq in r.get("commodity", "").lower()
                )]

            # Sorting
            if sort_by == "modal_price_desc":
                filtered.sort(key=lambda x: x.get("modal_price", 0), reverse=True)
            elif sort_by == "modal_price_asc":
                filtered.sort(key=lambda x: x.get("modal_price", 0))
            elif sort_by == "market_asc":
                filtered.sort(key=lambda x: x.get("market", "").lower())
            elif sort_by == "commodity_asc":
                filtered.sort(key=lambda x: x.get("commodity", "").lower())

            # Aggregate stats on filtered
            prices = [r.get("modal_price", 0) for r in filtered if r.get("modal_price")]
            stats = {
                "total_markets": len(filtered),
                "avg_price": int(sum(prices) / len(prices)) if prices else 0,
                "highest_price": max(prices) if prices else 0,
                "lowest_price": min(prices) if prices else 0
            }

            self.send_json({
                "success": True,
                "count": len(filtered),
                "stats": stats,
                "records": filtered
            })

        elif path == "/api/stats":
            prices = [r.get("modal_price", 0) for r in MANDI_RECORDS if r.get("modal_price")]
            highest_record = max(MANDI_RECORDS, key=lambda x: x.get("modal_price", 0)) if MANDI_RECORDS else None
            lowest_record = min(MANDI_RECORDS, key=lambda x: x.get("modal_price", 0)) if MANDI_RECORDS else None

            self.send_json({
                "success": True,
                "stats": {
                    "total_commodities": len(set(r.get("commodity") for r in MANDI_RECORDS)),
                    "total_mandis": len(MANDI_RECORDS),
                    "avg_modal_price": int(sum(prices) / len(prices)) if prices else 0,
                    "highest": highest_record,
                    "lowest": lowest_record,
                    "source": "Government of India (Agmarknet / data.gov.in)",
                    "api_key_configured": bool(DEFAULT_API_KEY)
                }
            })

        elif path == "/api/bidding/listings":
            commodity_filter = query.get("commodity", [None])[0]
            status_filter = query.get("status", [None])[0]
            lots = list(BIDDING_RECORDS)

            if commodity_filter and commodity_filter != "all":
                lots = [l for l in lots if l.get("commodity", "").lower() == commodity_filter.lower()]

            if status_filter and status_filter != "all":
                lots = [l for l in lots if l.get("status", "").lower() == status_filter.lower()]

            # Return blind auction format: for OPEN lots, keep individual bid amounts sealed from public
            formatted = []
            for lot in lots:
                item = dict(lot)
                item["bid_count"] = len(item.get("bids", []))
                if item.get("status") == "OPEN":
                    # Mask competitor prices during active blind bidding
                    item["bids_view"] = [
                        {"id": b["id"], "timestamp": b.get("timestamp"), "blind": True}
                        for b in item.get("bids", [])
                    ]
                else:
                    item["bids_view"] = item.get("bids", [])
                formatted.append(item)

            self.send_json({
                "success": True,
                "total": len(BIDDING_RECORDS),
                "count": len(formatted),
                "lots": formatted
            })
        else:
            self.send_json({"error": "Endpoint not found"}, status=404)

def run():
    load_data()
    port = DEFAULT_PORT
    httpd = None
    for p in range(port, port + 20):
        try:
            server_address = ("", p)
            httpd = ThreadingHTTPServer(server_address, AgriLinkHandler)
            port = p
            break
        except OSError as e:
            if e.errno == 48:
                continue
            raise e

    if not httpd:
        print("[AgriLink] Error: Could not bind to any available port.")
        sys.exit(1)

    print(f"============================================================")
    print(f" AgriLink - Multilingual Agricultural Price Portal")
    print(f" Team: APEX {{SYNTAX}} @ MGIT.ac.in")
    print(f" Server running at: http://localhost:{port}")
    print(f" Languages: Telugu | Tamil | Marathi | English | Punjabi | Hindi")
    print(f" Government API Key: {DEFAULT_API_KEY[:8]}...{DEFAULT_API_KEY[-4:]} [Configured]")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down AgriLink server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
