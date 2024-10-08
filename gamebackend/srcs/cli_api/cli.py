import argparse
import requests
import sys
import json
import asyncio

# Define the CLI tool
def main():
    parser = argparse.ArgumentParser(description="CLI for server-side Pong game")
    
    parser.add_argument("action", help="The action to perform", choices=["game_state"])
    parser.add_argument("--game_id", help="The game ID")

    args = parser.parse_args()

    if args.action == "game_state":
        if not args.game_id:
            print("You need to provide a game_id to check the game state")
            sys.exit(1)
        check_game_state(args.game_id)

# Function to check game state
def check_game_state(game_id):
    url = "http://gamebackend:9090/cli-api/info/"
    headers = {'Content-Type': 'application/json',}
    payload = {
        'game_id': game_id
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        print(f"Game state: {response.json()}")
    else:
        print(f"Error fetching game state: {response.text}")


if __name__ == "__main__":
    main()
