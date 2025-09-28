cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

set(rnoh_photo_manipulator_generated_dir "${CMAKE_CURRENT_SOURCE_DIR}/generated")
file(GLOB_RECURSE rnoh_photo_manipulator_generated_SRC "${rnoh_photo_manipulator_generated_dir}/**/*.cpp")
file(GLOB rnoh_photo_manipulator_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_photo_manipulator SHARED ${rnoh_photo_manipulator_generated_SRC} ${rnoh_photo_manipulator_SRC})
target_include_directories(rnoh_photo_manipulator PUBLIC ${CMAKE_CURRENT_SOURCE_DIR} ${rnoh_photo_manipulator_generated_dir})
target_link_libraries(rnoh_photo_manipulator PUBLIC rnoh)