from os import path
import bpy
import json

#################
#### Logging ####
#################

def info(v): print('\033[0m\033[2m' + v + '\033[0m')
def log(v): print('\033[0m' + v)
def warn(v): print('\033[0m\033[93m' + v + '\033[0m')
def error(v): print('\033[0m\033[91m' + v + '\033[0m')
def success(v): print('\033[0m\033[92m✓ ' + v + '\033[0m')


def green(v): return '\033[92m' + v + '\033[0m'
def cyan(v): return '\033[96m' + v + '\033[0m'
def yellow(v): return '\033[93m' + v + '\033[0m'
def magenta(v): return '\033[95m' + v + '\033[0m'
def red(v): return '\033[91m' + v + '\033[0m'


# Resolve a path from a project path
def resolvePath(fp='.', dirname='root'):
	if not dirname in paths:
		dirname = 'root'
	return path.normpath(path.join(paths[dirname], fp))


# Transform dict to object-literal syntax
class dotobject(dict):
	__getattr__ = dict.get
	__setattr__ = dict.__setitem__
	__delattr__ = dict.__delitem__

# Get all project paths
root = path.normpath(path.join(path.dirname(__file__), '..'))
assets = path.join(path.split(root)[0], 'assets')
paths = dotobject({
	'root': root,
	'export': path.join(assets, 'blender-exports'),
	'resolve': resolvePath,
	'relFilepath': path.relpath(bpy.data.filepath, root),
	'currentFolder': path.dirname(bpy.data.filepath)
})

print('paths >>',paths)

def writeJSON(fp, data, pretty=True):
	indent = 2 if pretty else 0
	with open(fp, 'w') as file:
		json.dump(data, file, indent=indent)


def export_curve_data_to_json(file_path):
	curves_data = []

	# Loop through all objects in the scene
	for obj in bpy.context.scene.objects:
		# Check if the object is a curve
		if obj.type == 'CURVE':
			curve_data = {
				"name": obj.name,
				"splines": []
			}

			# Get the curve data
			curve = obj.data

			# Loop through all splines in the curve
			for spline in curve.splines:
				spline_data = {
					"type": spline.type,
					"points": []
				}

				if spline.type == 'BEZIER':
					for point in spline.bezier_points:
						spline_data["points"].append({
							"co": list(point.co),
							"handle_left": list(point.handle_left),
							"handle_right": list(point.handle_right)
						})
				elif spline.type == 'NURBS':
					for point in spline.points:
						spline_data["points"].append({
							"co": list(point.co),
							"weight": point.weight
						})
				elif spline.type == 'POLY':
					for point in spline.points:
						spline_data["points"].append({
							"co": list(point.co)
						})

				curve_data["splines"].append(spline_data)

			curves_data.append(curve_data)

	# Write the data to a JSON file
	# with open(file_path, 'w') as file:
	writeJSON(path.join(file_path, 'curves.json'), curves_data)

# Set the path to the file where you want to save the curve data
outPath = paths['export']
print('outPath >>',outPath)
export_curve_data_to_json(outPath)
