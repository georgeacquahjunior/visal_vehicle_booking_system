from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models.changelog import Changelog
from ..models.users import User, Roles
from .. import db
from datetime import datetime

changelog_bp = Blueprint("changelog", __name__, url_prefix="/changelog")


# GET ALL CHANGELOGS (Public - published only by default)
@changelog_bp.route("/", methods=["GET"])
def get_changelogs():
    """
    Retrieve all published changelogs.
    Optional query param: include_unpublished=true (admin only)
    """
    include_unpublished = request.args.get("include_unpublished", "false").lower() == "true"
    
    try:
        if include_unpublished:
            changelogs = Changelog.query.order_by(Changelog.created_at.desc()).all()
        else:
            changelogs = Changelog.query.filter_by(is_published=True).order_by(
                Changelog.created_at.desc()
            ).all()
        
        return jsonify([changelog.to_dict() for changelog in changelogs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# GET SINGLE CHANGELOG
@changelog_bp.route("/<int:changelog_id>", methods=["GET"])
def get_changelog(changelog_id):
    """Retrieve a specific changelog entry."""
    try:
        changelog = Changelog.query.get(changelog_id)
        if not changelog:
            return jsonify({"error": "Changelog not found"}), 404
        
        if not changelog.is_published:
            return jsonify({"error": "Changelog not found"}), 404
        
        return jsonify(changelog.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# CREATE NEW CHANGELOG (Admin only)
@changelog_bp.route("/create", methods=["POST"])
@jwt_required()
def create_changelog():
    """Create a new changelog entry (Admin only)."""
    user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Check if user is admin
    user = User.query.get(user_id)
    if not user or user.role != Roles.ADMIN:
        return jsonify({"error": "Unauthorized. Admin access required."}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    # Validate required fields
    version = data.get("version")
    title = data.get("title")
    description = data.get("description")
    category = data.get("category", "General")
    is_published = data.get("is_published", False)
    
    if not all([version, title, description]):
        return jsonify({
            "error": "version, title, and description are required"
        }), 400
    
    # Validate category
    valid_categories = ["Feature", "Bug Fix", "Improvement", "General", "Security"]
    if category not in valid_categories:
        return jsonify({
            "error": f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        }), 400
    
    try:
        changelog = Changelog(
            version=version,
            title=title,
            description=description,
            category=category,
            author_id=user_id,
            is_published=is_published
        )
        
        db.session.add(changelog)
        db.session.commit()
        
        return jsonify({
            "message": "Changelog created successfully",
            "changelog": changelog.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# UPDATE CHANGELOG (Admin only)
@changelog_bp.route("/<int:changelog_id>", methods=["PUT"])
@jwt_required()
def update_changelog(changelog_id):
    """Update a changelog entry (Admin only)."""
    user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(user_id)
    if not user or user.role != Roles.ADMIN:
        return jsonify({"error": "Unauthorized. Admin access required."}), 403
    
    changelog = Changelog.query.get(changelog_id)
    if not changelog:
        return jsonify({"error": "Changelog not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    try:
        if "version" in data:
            changelog.version = data["version"]
        if "title" in data:
            changelog.title = data["title"]
        if "description" in data:
            changelog.description = data["description"]
        if "category" in data:
            valid_categories = ["Feature", "Bug Fix", "Improvement", "General", "Security"]
            if data["category"] not in valid_categories:
                return jsonify({
                    "error": f"Invalid category. Must be one of: {', '.join(valid_categories)}"
                }), 400
            changelog.category = data["category"]
        if "is_published" in data:
            changelog.is_published = data["is_published"]
        
        db.session.commit()
        return jsonify({
            "message": "Changelog updated successfully",
            "changelog": changelog.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# PUBLISH CHANGELOG (Admin only)
@changelog_bp.route("/<int:changelog_id>/publish", methods=["PATCH"])
@jwt_required()
def publish_changelog(changelog_id):
    """Publish a changelog entry (Admin only)."""
    user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(user_id)
    if not user or user.role != Roles.ADMIN:
        return jsonify({"error": "Unauthorized. Admin access required."}), 403
    
    changelog = Changelog.query.get(changelog_id)
    if not changelog:
        return jsonify({"error": "Changelog not found"}), 404
    
    try:
        changelog.is_published = True
        db.session.commit()
        
        return jsonify({
            "message": "Changelog published successfully",
            "changelog": changelog.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# DELETE CHANGELOG (Admin only)
@changelog_bp.route("/<int:changelog_id>", methods=["DELETE"])
@jwt_required()
def delete_changelog(changelog_id):
    """Delete a changelog entry (Admin only)."""
    user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(user_id)
    if not user or user.role != Roles.ADMIN:
        return jsonify({"error": "Unauthorized. Admin access required."}), 403
    
    changelog = Changelog.query.get(changelog_id)
    if not changelog:
        return jsonify({"error": "Changelog not found"}), 404
    
    try:
        db.session.delete(changelog)
        db.session.commit()
        
        return jsonify({"message": "Changelog deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
