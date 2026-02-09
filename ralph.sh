#!/bin/bash
# Ralph - Autonomous AI Agent Loop for AMBITIA
# Usage: ./ralph.sh [max_iterations]
# Run from Git Bash on Windows

# Do NOT use set -e: Claude Code may return non-zero and that's OK

MAX_ITERATIONS=${1:-50}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "=========================================="
echo "  RALPH - AMBITIA Autonomous Builder"
echo "  Max iterations: $MAX_ITERATIONS"
echo "=========================================="

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "  $(date)"
  echo "==============================================================="

  # Check how many stories are left
  REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE" 2>/dev/null || echo "?")
  echo "  Stories remaining: $REMAINING"

  # Run Claude Code in autonomous mode
  OUTPUT=$(claude --dangerously-skip-permissions --print < "$SCRIPT_DIR/CLAUDE.md" 2>&1 | tee /dev/stderr) || true

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "=========================================="
    echo "  RALPH COMPLETED ALL TASKS!"
    echo "  Finished at iteration $i of $MAX_ITERATIONS"
    echo "=========================================="
    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
