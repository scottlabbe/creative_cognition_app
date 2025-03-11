# plots/generate_plot.py

import matplotlib
matplotlib.use('Agg')  # So we can render to PNG without a GUI
import matplotlib.pyplot as plt
import os

def generate_plot(application_score: float, learning_score: float, submission_id: str) -> str:
    """
    Generates a 2D scatter plot (x=application, y=learning) for the given submission.
    Saves it as static/plots/<submission_id>.png
    Returns the relative filename so you can embed it in HTML.
    """

    # 1. Create the figure
    fig, ax = plt.subplots(figsize=(4, 4))

    # 2. Set axis ranges (adjust as needed)
    ax.set_xlim([-15, 15])
    ax.set_ylim([-15, 15])

    ax.set_xlabel("Application")
    ax.set_ylabel("Learning")
    ax.set_title("Your Creative Style")

    # 3. Plot the single point
    ax.scatter(application_score, learning_score, color='red', s=100)

    # 4. Draw crossing lines for 0,0 if you want quadrants
    ax.axhline(y=0, color='gray', linestyle='--', linewidth=1)
    ax.axvline(x=0, color='gray', linestyle='--', linewidth=1)

    # 5. Save to static/plots/
    plot_filename = f"plots/{submission_id}.png"
    full_path = os.path.join("static", plot_filename)
    plt.savefig(full_path, bbox_inches='tight')
    plt.close(fig)

    return plot_filename