FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# =========================================================
# System dependencies
# =========================================================

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    pkg-config \
    libssl-dev \
    libpq-dev \
    uuid-dev \
    zlib1g-dev \
    libjsoncpp-dev \
    libyaml-cpp-dev \
    libsqlite3-dev \
    libbrotli-dev \
    libboost-dev \
    libboost-system-dev \
    libboost-filesystem-dev \
    libboost-regex-dev \
    libboost-thread-dev \
    libjsoncpp-dev \
    && rm -rf /var/lib/apt/lists/*


# =========================================================
# Build Drogon
# =========================================================

RUN git clone --depth 1 \
    https://github.com/drogonframework/drogon.git \
    /opt/drogon

RUN cmake \
    -S /opt/drogon \
    -B /opt/drogon/build \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_CTL=OFF \
    -DBUILD_EXAMPLES=OFF \
    -DBUILD_TESTING=OFF

RUN cmake \
    --build /opt/drogon/build \
    -j2

RUN cmake \
    --install /opt/drogon/build

RUN rm -rf /opt/drogon


# =========================================================
# NishandhiniMart
# =========================================================

WORKDIR /app

COPY . .


# =========================================================
# Configure project
# =========================================================

RUN cmake \
    -S . \
    -B build \
    -DCMAKE_BUILD_TYPE=Release


# =========================================================
# Build project
# =========================================================

RUN cmake \
    --build build \
    -j2


# =========================================================
# Render port
# =========================================================

EXPOSE 10000


# =========================================================
# Start backend
# =========================================================

CMD ["./build/NishandhiniMart"]