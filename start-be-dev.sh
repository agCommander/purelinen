#!/bin/bash

# Start Medusa Backend (Development Mode - No Docker Required)
echo "🚀 Starting Medusa Backend (Development Mode)..."
echo "📁 Working directory: $(pwd)"
echo "🔧 Backend will run on: http://localhost:9000"
echo "⚙️  Admin panel: http://localhost:9000/app"
echo "🔍 Search is DISABLED for development"
echo ""

# Find pg_isready command
PG_ISREADY=$(which pg_isready 2>/dev/null || echo "/usr/local/opt/postgresql@15/bin/pg_isready")

# Check if PostgreSQL is running
if ! $PG_ISREADY -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not responding. Checking status..."
    
    # Try to start PostgreSQL via Homebrew
    if command -v brew > /dev/null 2>&1; then
        # Check if postgresql@15 is installed
        if brew list postgresql@15 > /dev/null 2>&1; then
            # Check brew services status
            SERVICE_STATUS=$(brew services list | grep postgresql@15 | awk '{print $2}')
            
            if [ "$SERVICE_STATUS" = "started" ] || [ "$SERVICE_STATUS" = "error" ]; then
                echo "🔄 PostgreSQL service is marked as started but not responding. Restarting..."
                brew services restart postgresql@15
            else
                echo "🐘 Starting PostgreSQL 15..."
                brew services start postgresql@15
            fi
            
            echo "⏳ Waiting for PostgreSQL to be ready..."
            
            # Give PostgreSQL time to start up after restart/start
            sleep 3
            
            # Retry up to 20 times with 1 second delay (20 seconds total after initial wait)
            MAX_RETRIES=20
            RETRY_COUNT=0
            POSTGRES_READY=0
            while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
                # Try pg_isready first
                if $PG_ISREADY -h localhost -p 5432 > /dev/null 2>&1; then
                    POSTGRES_READY=1
                    break
                fi
                # Fallback: check if port is listening (PostgreSQL might be starting)
                if command -v lsof > /dev/null 2>&1; then
                    if lsof -i :5432 > /dev/null 2>&1; then
                        # Port is open, give it one more second
                        sleep 1
                        if $PG_ISREADY -h localhost -p 5432 > /dev/null 2>&1; then
                            POSTGRES_READY=1
                            break
                        fi
                    fi
                fi
                # Show progress every 5 seconds
                if [ $((RETRY_COUNT % 5)) -eq 4 ] && [ $RETRY_COUNT -gt 0 ]; then
                    echo "   Still waiting... (${RETRY_COUNT}s elapsed)"
                fi
                if [ $RETRY_COUNT -lt $((MAX_RETRIES - 1)) ]; then
                    sleep 1
                fi
                RETRY_COUNT=$((RETRY_COUNT + 1))
            done
            
            if [ $POSTGRES_READY -eq 1 ]; then
                echo "✅ PostgreSQL is now running!"
            fi
            
            # Final check
            if [ $POSTGRES_READY -eq 0 ]; then
                echo "❌ PostgreSQL failed to start after $((MAX_RETRIES + 3)) seconds."
                echo "💡 Try manually: brew services restart postgresql@15"
                echo "💡 Or check logs: tail -f /usr/local/var/log/postgresql@15.log"
                echo "💡 Check if it's running: $PG_ISREADY -h localhost -p 5432"
                exit 1
            fi
        else
            echo "❌ PostgreSQL@15 not found. Please install it:"
            echo "   brew install postgresql@15"
            exit 1
        fi
    else
        echo "❌ Homebrew not found. Please start PostgreSQL manually."
        exit 1
    fi
    echo ""
else
    echo "✅ PostgreSQL is already running!"
    echo ""
fi

cd medusa-backend/purelinen
npm run dev
